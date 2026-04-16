from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, List, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
from bson import ObjectId
import os, logging, json, re, uuid
import bcrypt, jwt
from groq import AsyncGroq

from franchise_data import FRANCHISE_DATA

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ── Config ──────────────────────────────────────────────────────────────────
MONGO_URL       = os.environ['MONGO_URL']
DB_NAME         = os.environ['DB_NAME']
JWT_SECRET      = os.environ['JWT_SECRET']
JWT_ALGO        = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_DAYS        = int(os.environ.get('JWT_EXPIRY_DAYS', 7))
GROQ_API_KEY    = os.environ.get('GROQ_API_KEY')
GROQ_MODEL      = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
# FRONTEND_URL used for CORS — set to your Vercel URL in Render env vars
FRONTEND_URL    = os.environ.get('FRONTEND_URL', '*')

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# ── DB & AI clients (initialised in lifespan) ────────────────────────────────
mongo_client: AsyncIOMotorClient = None
db = None
groq_client = None

# ── Lifespan (replaces deprecated @app.on_event) ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_client, db, groq_client
    # ── startup ──
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    db = mongo_client[DB_NAME]
    groq_client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    await seed()
    logger.info("Server started successfully.")
    yield
    # ── shutdown ──
    mongo_client.close()
    logger.info("Server shut down.")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Franchise Platform API", redirect_slashes=False, lifespan=lifespan)

# CORS — restrict origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-franchise-connect.vercel.app",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ObjectId helper ──────────────────────────────────────────────────────────
def to_str(v): return str(v) if isinstance(v, ObjectId) else v
PyObjectId = Annotated[str, BeforeValidator(to_str)]

class BaseDoc(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# ── Auth helpers ─────────────────────────────────────────────────────────────
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_pw(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def make_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

bearer = HTTPBearer()

async def get_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        data = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        return data
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_owner(user=Depends(get_user)):
    if user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")
    return user

# ── Groq helper ──────────────────────────────────────────────────────────────
async def ask_groq(messages: list, system: str = "", max_tokens: int = 2000) -> str:
    if not groq_client:
        raise HTTPException(500, "AI service not configured")
    msgs = ([{"role": "system", "content": system}] if system else []) + messages
    resp = await groq_client.chat.completions.create(
        model=GROQ_MODEL, messages=msgs, temperature=0.7, max_tokens=max_tokens
    )
    return resp.choices[0].message.content

# ── Pydantic models ──────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    name: str; email: str; password: str; role: str = "seeker"

class LoginIn(BaseModel):
    email: str; password: str

class QuizIn(BaseModel):
    budget: str
    zone: str
    experience: str
    risk: str
    categories: List[str]

class ChatIn(BaseModel):
    franchise_id: str; message: str; session_id: Optional[str] = None

class FranchiseCreate(BaseModel):
    name: str; category: str; brand_type: str; short_description: str
    outlet_format: str; investment_min: int; investment_max: int
    franchise_fee_display: str; royalty_level: str; royalty_pct: float
    min_area_sqft: int; max_area_sqft: int; best_chennai_zones: List[str]
    rent_sensitivity: str; footfall_dependency: str; staff_required: str
    operational_complexity: str; beginner_friendly: bool
    expected_revenue_min: int; expected_revenue_max: int
    breakeven_months_min: int; breakeven_months_max: int
    contact_email: Optional[str] = None; contact_phone: Optional[str] = None

# ── Routers ──────────────────────────────────────────────────────────────────
api       = APIRouter(prefix="/api", redirect_slashes=False)
auth_r    = APIRouter(prefix="/auth",       tags=["Auth"])
franchise_r = APIRouter(prefix="/franchises", tags=["Franchises"], redirect_slashes=False)
ai_r      = APIRouter(prefix="/ai",         tags=["AI"])
location_r = APIRouter(prefix="/location",  tags=["Location"])

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}

# ─────────────────────── AUTH ─────────────────────────────────────────────────
@auth_r.post("/register")
async def register(body: RegisterIn):
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")
    if body.role not in ("seeker", "owner"):
        raise HTTPException(400, "Role must be seeker or owner")
    doc = {
        "name": body.name, "email": body.email,
        "password_hash": hash_pw(body.password), "role": body.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "saved_franchises": [], "quiz_results": []
    }
    res = await db.users.insert_one(doc)
    token = make_token(str(res.inserted_id), body.email, body.role)
    return {"token": token, "role": body.role, "name": body.name, "email": body.email}

@auth_r.post("/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email})
    if not user or not check_pw(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(str(user["_id"]), user["email"], user["role"])
    return {"token": token, "role": user["role"], "name": user["name"], "email": user["email"]}

@auth_r.get("/profile")
async def profile(user=Depends(get_user)):
    u = await db.users.find_one({"_id": ObjectId(user["sub"])}, {"password_hash": 0, "_id": 0})
    if not u:
        raise HTTPException(404, "User not found")
    return u

# ─────────────────────── FRANCHISES ──────────────────────────────────────────
@franchise_r.get("")
async def list_franchises(
    category: Optional[str] = None,
    search: Optional[str] = None,
    investment_max: Optional[int] = None,
    zone: Optional[str] = None,
    risk: Optional[str] = None,
    beginner: Optional[bool] = None,
    page: int = 1, limit: int = 20
):
    q: dict = {"is_active": True}
    if category and category != "All":
        q["category"] = category
    if search:
        q["$or"] = [{"name": {"$regex": search, "$options": "i"}},
                    {"short_description": {"$regex": search, "$options": "i"}}]
    if investment_max:
        q["investment_max"] = {"$lte": investment_max}
    if zone and zone != "any":
        zone_map = {
            "south_omr": "South Chennai", "central": "Central Chennai",
            "north": "North Chennai", "west": "West Chennai", "outskirts": "Outskirts"
        }
        z = zone_map.get(zone, zone)
        q["best_chennai_zones"] = {"$in": [z, "OMR/IT Corridor"]}
    if risk:
        q["risk_level"] = risk.capitalize()
    if beginner is not None:
        q["beginner_friendly"] = beginner

    skip = (page - 1) * limit
    cursor = db.franchises.find(q, {"_id": 0}).skip(skip).limit(limit)
    items = await cursor.to_list(limit)
    total = await db.franchises.count_documents(q)
    return {"franchises": items, "total": total, "page": page, "pages": -(-total // limit)}

@franchise_r.get("/categories")
async def categories():
    cats = await db.franchises.distinct("category", {"is_active": True})
    return {"categories": sorted(cats)}

@franchise_r.get("/mine")
async def my_franchises(user=Depends(get_owner)):
    items = await db.franchises.find(
        {"created_by": user["sub"], "is_active": True}, {"_id": 0}
    ).to_list(100)
    return {"franchises": items}

@franchise_r.get("/{fid}")
async def get_franchise(fid: str):
    f = await db.franchises.find_one({"franchise_id": fid, "is_active": True}, {"_id": 0})
    if not f:
        raise HTTPException(404, "Franchise not found")
    return f

@franchise_r.post("/")
async def create_franchise(body: FranchiseCreate, user=Depends(get_owner)):
    from franchise_data import _viability
    score, risk = _viability(
        body.investment_max, body.breakeven_months_max,
        body.royalty_level, body.beginner_friendly,
        body.operational_complexity, body.brand_type
    )
    doc = body.model_dump()
    doc.update({
        "franchise_id": str(uuid.uuid4()), "viability_score": score,
        "risk_level": risk, "is_active": True,
        "created_by": user["sub"], "training_provided": True,
        "setup_includes": ["Equipment", "Branding", "Training"],
        "franchise_fee_numeric": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    await db.franchises.insert_one(doc)
    doc.pop("_id", None)
    return doc

@franchise_r.put("/{fid}")
async def update_franchise(fid: str, body: dict, user=Depends(get_owner)):
    body.pop("_id", None); body.pop("franchise_id", None)
    res = await db.franchises.update_one(
        {"franchise_id": fid, "created_by": user["sub"]}, {"$set": body}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Franchise not found or not yours")
    return {"message": "Updated"}

@franchise_r.delete("/{fid}")
async def delete_franchise(fid: str, user=Depends(get_owner)):
    res = await db.franchises.update_one(
        {"franchise_id": fid, "created_by": user["sub"]}, {"$set": {"is_active": False}}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Franchise not found or not yours")
    return {"message": "Deleted"}

# ─────────────────────── AI ───────────────────────────────────────────────────
BUDGET_MAP = {
    "under_5L": 500000, "5L_15L": 1500000, "15L_30L": 3000000,
    "30L_60L": 6000000, "above_60L": 999999999
}
BUDGET_LABEL = {
    "under_5L": "Under ₹5 Lakhs", "5L_15L": "₹5–15 Lakhs",
    "15L_30L": "₹15–30 Lakhs", "30L_60L": "₹30–60 Lakhs", "above_60L": "Above ₹60 Lakhs"
}
ZONE_LABEL = {
    "south_omr": "South Chennai / OMR / IT Corridor",
    "central": "Central Chennai (Anna Nagar)",
    "north": "North Chennai (Padi / Ambattur)",
    "west": "West Chennai (Porur / Vadapalani)",
    "outskirts": "Outskirts (GST / ECR)",
    "any": "Any zone in Chennai"
}

@ai_r.post("/match")
async def ai_match(quiz: QuizIn, user=Depends(get_user)):
    budget_max = BUDGET_MAP.get(quiz.budget, 999999999)
    q: dict = {"is_active": True, "investment_max": {"$lte": budget_max}}
    if quiz.categories and "All" not in quiz.categories:
        q["category"] = {"$in": quiz.categories}

    all_matches = await db.franchises.find(q, {"_id": 0}).to_list(200)

    summaries = []
    for f in all_matches[:40]:
        summaries.append({
            "id": f.get("franchise_id", f.get("name", "")),
            "name": f["name"], "category": f["category"],
            "brand_type": f["brand_type"],
            "investment": f"₹{f['investment_min']//100000}-{f['investment_max']//100000}L",
            "royalty": f["royalty_level"],
            "beginner_friendly": f["beginner_friendly"],
            "operational_complexity": f["operational_complexity"],
            "viability_score": f["viability_score"],
            "risk_level": f["risk_level"],
            "zones": f["best_chennai_zones"],
            "breakeven": f"{f['breakeven_months_min']}-{f['breakeven_months_max']} months",
            "description": f["short_description"][:80]
        })

    system = """You are an expert franchise advisor specializing in the Chennai, India market.
Analyze franchise options for a potential investor and rank the best matches.
Always return ONLY valid JSON with no markdown, no explanation outside the JSON."""

    prompt = f"""User Investment Profile:
- Budget: {BUDGET_LABEL.get(quiz.budget, quiz.budget)}
- Preferred Location: {ZONE_LABEL.get(quiz.zone, quiz.zone)}
- Business Experience: {quiz.experience}
- Risk Tolerance: {quiz.risk}
- Category Interest: {', '.join(quiz.categories)}

Franchise Options:
{json.dumps(summaries, indent=2)}

Return top 12 franchise matches ranked by fit. JSON format ONLY:
{{
  "rankings": [
    {{"franchise_id": "exact id from list", "match_score": 85, "reason": "1-sentence explanation"}}
  ]
}}"""

    try:
        raw = await ask_groq([{"role": "user", "content": prompt}], system, 1500)
        raw = raw.strip()
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        result = json.loads(json_match.group() if json_match else raw)
        rankings = result.get("rankings", [])
    except Exception as e:
        logger.error(f"Groq match error: {e}")
        rankings = [{
            "franchise_id": f.get("franchise_id", f["name"]),
            "match_score": f["viability_score"],
            "reason": f"Good match for your {quiz.budget} budget in {quiz.zone}."
        } for f in all_matches[:12]]

    franchise_map = {f.get("franchise_id", f["name"]): f for f in all_matches}
    enriched = []
    for r in rankings[:12]:
        fid = r.get("franchise_id", "")
        f = franchise_map.get(fid)
        if not f:
            for item in all_matches:
                if item["name"].lower() == str(fid).lower():
                    f = item; break
        if f:
            enriched.append({**f, "match_score": r.get("match_score", 70),
                              "match_reason": r.get("reason", "")})

    await db.quiz_results.insert_one({
        "user_id": user["sub"], "quiz_answers": quiz.model_dump(),
        "recommendations": [e.get("franchise_id", e.get("name")) for e in enriched[:5]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"recommendations": enriched, "total_found": len(all_matches)}

@ai_r.post("/chat")
async def ai_chat(body: ChatIn, user=Depends(get_user)):
    f = await db.franchises.find_one({"franchise_id": body.franchise_id}, {"_id": 0})
    if not f:
        f = await db.franchises.find_one({"name": {"$regex": body.franchise_id, "$options": "i"}}, {"_id": 0})
    if not f:
        raise HTTPException(404, "Franchise not found")

    session_id = body.session_id or str(uuid.uuid4())
    session = await db.chat_sessions.find_one({"session_id": session_id})
    history = session.get("messages", []) if session else []

    system = f"""You are a friendly, expert franchise advisor for {f['name']} in Chennai, India.
You help first-time entrepreneurs understand this franchise clearly and make confident decisions.
Use simple, jargon-free language. Be concise (2-4 sentences max per response).
Always be encouraging but honest about risks.

Franchise Context:
- Name: {f['name']}
- Category: {f['category']}
- Investment: ₹{f['investment_min']//100000}-{f['investment_max']//100000} Lakhs
- Royalty: {f['royalty_level']}
- Viability Score: {f['viability_score']}/100 ({f['risk_level']})
- Break-even: {f['breakeven_months_min']}-{f['breakeven_months_max']} months
- Beginner Friendly: {'Yes' if f['beginner_friendly'] else 'No'}
- Best Zones: {', '.join(f.get('best_chennai_zones', []))}
- Description: {f['short_description']}"""

    msgs = history[-8:] + [{"role": "user", "content": body.message}]
    ai_response = await ask_groq(msgs, system, 400)

    new_msgs = history + [
        {"role": "user", "content": body.message},
        {"role": "assistant", "content": ai_response}
    ]
    await db.chat_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "session_id": session_id, "franchise_id": body.franchise_id,
            "user_id": user["sub"], "messages": new_msgs[-20:],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"response": ai_response, "session_id": session_id}

@ai_r.get("/chat/{session_id}")
async def get_chat(session_id: str, user=Depends(get_user)):
    session = await db.chat_sessions.find_one(
        {"session_id": session_id, "user_id": user["sub"]}, {"_id": 0}
    )
    if not session:
        return {"messages": [], "session_id": session_id}
    return session

@ai_r.post("/roadmap")
async def ai_roadmap(body: dict, user=Depends(get_user)):
    fid = body.get("franchise_id", "")
    f = await db.franchises.find_one({"franchise_id": fid}, {"_id": 0})
    if not f:
        f = await db.franchises.find_one({"name": {"$regex": fid, "$options": "i"}}, {"_id": 0})
    if not f:
        raise HTTPException(404, "Franchise not found")

    zone = body.get("zone", "South Chennai")
    experience = body.get("experience", "none")

    system = "You are a Chennai franchise launch expert. Create a detailed, actionable roadmap.\nReturn ONLY valid JSON with no markdown."

    prompt = f"""Create a 7-step launch roadmap for {f['name']} franchise in Chennai.
Investor Profile: Investment ₹{f['investment_min']//100000}-{f['investment_max']//100000}L,
Zone: {zone}, Experience: {experience}

Return JSON only:
{{
  "franchise_name": "{f['name']}",
  "total_duration": "X months",
  "steps": [
    {{
      "step": 1, "title": "Step title",
      "duration": "Week 1-2",
      "description": "2-sentence description",
      "actions": ["action 1", "action 2", "action 3"],
      "cost_estimate": "₹X",
      "icon": "emoji"
    }}
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}}"""

    try:
        raw = await ask_groq([{"role": "user", "content": prompt}], system, 2000)
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        return json.loads(json_match.group() if json_match else raw)
    except Exception as e:
        logger.error(f"Roadmap error: {e}")
        return {
            "franchise_name": f["name"],
            "total_duration": f"{f['breakeven_months_max']} months",
            "steps": [
                {"step": 1, "title": "Initial Research & Due Diligence", "duration": "Week 1-2",
                 "description": f"Deep-dive into {f['name']} franchise terms. Visit existing outlets and speak with current franchisees.",
                 "actions": ["Request Franchise Disclosure Document", "Visit 2-3 active outlets", "Talk to existing franchisees", "Consult a CA"], "cost_estimate": "₹0", "icon": "🔍"},
                {"step": 2, "title": "Financial Planning", "duration": "Week 2-3",
                 "description": "Secure your investment capital and plan for working capital needs beyond setup costs.",
                 "actions": ["Open dedicated business account", f"Arrange ₹{f['investment_min']//100000}-{f['investment_max']//100000}L funding", "Plan 3-month working capital", "Consider MUDRA loan if needed"], "cost_estimate": f"₹{f['investment_min']//100000}-{f['investment_max']//100000}L", "icon": "💰"},
                {"step": 3, "title": "Location Scouting in Chennai", "duration": "Week 3-4",
                 "description": f"Scout for ideal location in {f.get('best_chennai_zones', ['South Chennai'])[0]}. Negotiate lease terms carefully.",
                 "actions": ["Survey " + ", ".join(f.get("best_chennai_zones", [])[:2]), "Check footfall data", "Negotiate 3-year lease", "Confirm municipal approvals"], "cost_estimate": "₹0", "icon": "📍"},
                {"step": 4, "title": "Legal & Licensing", "duration": "Week 4-5",
                 "description": "Complete all regulatory requirements. This is critical — don't skip any registrations.",
                 "actions": ["Register business (Sole/LLP/Pvt Ltd)", "FSSAI license (if F&B)", "GST registration", "Sign franchise agreement with lawyer review"], "cost_estimate": "₹15,000-₹40,000", "icon": "⚖️"},
                {"step": 5, "title": "Setup & Infrastructure", "duration": "Week 5-8",
                 "description": f"Complete physical setup as per {f['name']} standards. Franchisor team will guide interior and equipment.",
                 "actions": ["Interior design per brand guidelines", "Equipment installation", "Staff recruitment (need: " + str(f.get("staff_required", "3-5")) + " people)", "Utilities setup"], "cost_estimate": f"₹{f['investment_min']//100000}-{f['investment_max']//100000}L", "icon": "🏗️"},
                {"step": 6, "title": "Training & Soft Launch", "duration": "Week 8-10",
                 "description": "Complete franchisor training program. Run a soft launch with invited guests before full opening.",
                 "actions": ["Complete brand training", "Staff skills training", "Soft launch (invite 50+ people)", "Collect feedback & improve"], "cost_estimate": "₹5,000-₹20,000", "icon": "🎓"},
                {"step": 7, "title": "Grand Opening & Marketing", "duration": "Week 10-12",
                 "description": "Official grand opening with local marketing push. List on aggregators and social media.",
                 "actions": ["Grand opening event", "Register on Swiggy/Zomato (if F&B)", "Google Business Profile setup", "Instagram/WhatsApp marketing"], "cost_estimate": "₹20,000-₹50,000", "icon": "🚀"}
            ],
            "tips": [
                f"Choose your location in {f.get('best_chennai_zones', ['South Chennai'])[0]} carefully — it's your biggest success factor.",
                f"Expected break-even is {f['breakeven_months_min']}-{f['breakeven_months_max']} months. Don't panic in month 1-3.",
                "Always keep 3 months of operating costs as emergency reserve."
            ]
        }

@ai_r.post("/compare-insight")
async def compare_insight(body: dict, user=Depends(get_user)):
    fids = body.get("franchise_ids", [])
    franchises = []
    for fid in fids[:3]:
        f = await db.franchises.find_one({"franchise_id": fid}, {"_id": 0})
        if not f:
            f = await db.franchises.find_one({"name": {"$regex": str(fid), "$options": "i"}}, {"_id": 0})
        if f:
            franchises.append(f)

    if len(franchises) < 2:
        raise HTTPException(400, "Need at least 2 franchises to compare")

    names = [f["name"] for f in franchises]
    summaries = [{
        "name": f["name"],
        "investment": f"₹{f['investment_min']//100000}-{f['investment_max']//100000}L",
        "royalty": f["royalty_level"], "viability": f["viability_score"],
        "risk": f["risk_level"], "breakeven": f"{f['breakeven_months_min']}-{f['breakeven_months_max']}mo",
        "beginner": f["beginner_friendly"], "category": f["category"]
    } for f in franchises]

    prompt = f"""Compare these franchise options: {', '.join(names)}

{json.dumps(summaries, indent=2)}

Give a concise verdict (3-4 sentences) on which is best and why, mentioning key trade-offs.
Return JSON: {{"verdict": "...", "best_for_beginners": "name", "best_roi": "name", "lowest_risk": "name"}}"""

    try:
        raw = await ask_groq([{"role": "user", "content": prompt}],
                             "You are a franchise analyst. Return only JSON.", 500)
        jm = re.search(r'\{.*\}', raw, re.DOTALL)
        return json.loads(jm.group() if jm else raw)
    except Exception:
        return {
            "verdict": f"Comparing {', '.join(names)}: each offers different trade-offs in investment and risk.",
            "best_for_beginners": names[0], "best_roi": names[0], "lowest_risk": names[0]
        }

# ─────────────────────── LOCATION ─────────────────────────────────────────────
CHENNAI_ZONES = [
    {"id": "south_omr", "name": "South Chennai / OMR", "subzones": "Velachery, Perungudi, Sholinganallur, Navalur",
     "profile": "IT professionals, affluent residents, delivery-heavy", "avg_rent_sqft": 80,
     "best_categories": ["Tea & Coffee", "Car Care", "Shawarma/BBQ", "Salon"],
     "saturation": {"Tea & Coffee": "High", "Shawarma/BBQ": "Medium", "Biryani": "Medium",
                    "Pharmacy": "Low", "Salon": "Medium", "Car Care": "Low"},
     "demand": {"Tea & Coffee": 92, "Shawarma/BBQ": 78, "Biryani": 85,
                "Pharmacy": 70, "Salon": 80, "Car Care": 75}},
    {"id": "central", "name": "Central Chennai (Anna Nagar / T Nagar)", "subzones": "Anna Nagar, T Nagar, Aminjikarai, Chetpet",
     "profile": "Dense commercial, high footfall, mixed demographics", "avg_rent_sqft": 90,
     "best_categories": ["Tea & Coffee", "Pharmacy", "Salon", "Biryani"],
     "saturation": {"Tea & Coffee": "High", "Shawarma/BBQ": "High", "Biryani": "High",
                    "Pharmacy": "Medium", "Salon": "Medium", "Car Care": "Low"},
     "demand": {"Tea & Coffee": 95, "Shawarma/BBQ": 82, "Biryani": 90,
                "Pharmacy": 88, "Salon": 85, "Car Care": 60}},
    {"id": "north", "name": "North Chennai (Padi / Ambattur)", "subzones": "Padi, Ambattur, Anna Nagar West, Villivakkam",
     "profile": "Industrial workers, middle-class families, underserved market", "avg_rent_sqft": 55,
     "best_categories": ["Tea & Coffee", "Biryani", "Pharmacy"],
     "saturation": {"Tea & Coffee": "Medium", "Shawarma/BBQ": "Low", "Biryani": "Medium",
                    "Pharmacy": "Low", "Salon": "Low", "Car Care": "Low"},
     "demand": {"Tea & Coffee": 80, "Shawarma/BBQ": 60, "Biryani": 75,
                "Pharmacy": 72, "Salon": 65, "Car Care": 55}},
    {"id": "west", "name": "West Chennai (Porur / Vadapalani)", "subzones": "Porur, Vadapalani, Koyambedu, CMBT",
     "profile": "Transit hub, mixed commercial/residential, growing IT presence", "avg_rent_sqft": 65,
     "best_categories": ["Tea & Coffee", "Shawarma/BBQ", "Salon"],
     "saturation": {"Tea & Coffee": "Medium", "Shawarma/BBQ": "Medium", "Biryani": "Low",
                    "Pharmacy": "Medium", "Salon": "Low", "Car Care": "Medium"},
     "demand": {"Tea & Coffee": 82, "Shawarma/BBQ": 70, "Biryani": 65,
                "Pharmacy": 75, "Salon": 72, "Car Care": 68}},
    {"id": "outskirts", "name": "Outskirts (GST Road / ECR)", "subzones": "Pallavaram, Tambaram, Poonamallee, ECR",
     "profile": "Emerging residential zones, highway-facing, low competition", "avg_rent_sqft": 40,
     "best_categories": ["Car Care", "Pharmacy", "Tea & Coffee"],
     "saturation": {"Tea & Coffee": "Low", "Shawarma/BBQ": "Low", "Biryani": "Low",
                    "Pharmacy": "Low", "Salon": "Low", "Car Care": "Low"},
     "demand": {"Tea & Coffee": 72, "Shawarma/BBQ": 55, "Biryani": 60,
                "Pharmacy": 68, "Salon": 58, "Car Care": 70}}
]

@location_r.get("/zones")
async def get_zones():
    return {"zones": CHENNAI_ZONES}

@location_r.get("/intelligence")
async def location_intelligence():
    categories = ["Tea & Coffee", "Shawarma/BBQ", "Biryani", "Pharmacy", "Salon", "Car Care"]
    insights = []
    for cat in categories:
        best_zone = max(CHENNAI_ZONES, key=lambda z: z["demand"].get(cat, 0) - (
            {"High": 30, "Medium": 15, "Low": 0}.get(z["saturation"].get(cat, "Low"), 0)
        ))
        insights.append({"category": cat, "best_zone": best_zone["name"],
                         "opportunity_score": best_zone["demand"].get(cat, 0)})
    return {"zones": CHENNAI_ZONES, "insights": insights}

# ─────────────────────── COMPARE ─────────────────────────────────────────────
@api.post("/compare")
async def compare(body: dict):
    fids = body.get("franchise_ids", [])
    result = []
    for fid in fids[:3]:
        f = await db.franchises.find_one({"franchise_id": fid}, {"_id": 0})
        if not f:
            f = await db.franchises.find_one({"name": {"$regex": str(fid), "$options": "i"}}, {"_id": 0})
        if f:
            result.append(f)
    return {"franchises": result}

# ─────────────────────── ROUTER WIRING ───────────────────────────────────────
api.include_router(auth_r)
api.include_router(franchise_r)
api.include_router(ai_r)
api.include_router(location_r)
app.include_router(api)

# ─────────────────────── SEED ────────────────────────────────────────────────
async def seed():
    count = await db.franchises.count_documents({})
    if count > 0:
        logger.info(f"DB already has {count} franchises, skipping seed.")
        return
    logger.info("Seeding franchise data...")
    docs = []
    for f in FRANCHISE_DATA:
        f["franchise_id"] = str(uuid.uuid4())
        f["created_at"] = datetime.now(timezone.utc).isoformat()
        docs.append(f)
    await db.franchises.insert_many(docs)
    await db.franchises.create_index("franchise_id")
    await db.franchises.create_index("category")
    await db.franchises.create_index("viability_score")
    logger.info(f"Seeded {len(docs)} franchises successfully.")
