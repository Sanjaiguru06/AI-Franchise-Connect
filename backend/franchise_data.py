"""
Comprehensive franchise data for 130+ franchises across 6 categories.
All investment values in Indian Rupees.  1 Lakh = 100,000
"""

def _viability(inv_max, be_max, royalty, beginner, complexity, brand):
    score = 0
    if inv_max <= 500000: score += 25
    elif inv_max <= 1500000: score += 20
    elif inv_max <= 3000000: score += 15
    elif inv_max <= 6000000: score += 10
    else: score += 5

    if be_max <= 10: score += 25
    elif be_max <= 18: score += 20
    elif be_max <= 24: score += 15
    elif be_max <= 36: score += 10
    else: score += 5

    r = royalty.lower()
    if r in ('none', '0', 'no royalty', '0%'): score += 20
    elif r in ('low', 'included'): score += 15
    elif r == 'medium': score += 10
    else: score += 5

    if beginner: score += 10

    c = complexity.lower()
    if 'low' in c and 'medium' not in c: score += 10
    elif 'low-medium' in c or c == 'low medium': score += 8
    elif c == 'medium': score += 5
    elif 'medium-high' in c: score += 3
    else: score += 1

    b = brand.lower()
    if b == 'national': score += 10
    elif b == 'regional': score += 7
    else: score += 5

    score = min(100, max(0, score))
    risk = 'Safe' if score >= 70 else 'Moderate' if score >= 50 else 'Risk'
    return score, risk


def _f(name, category, brand_type, desc, outlet, inv_min, inv_max,
        fee_display, fee_num, royalty, royalty_pct, area_min, area_max,
        zones, rent_sens, footfall, staff, complexity, beginner,
        rev_min, rev_max, be_min, be_max, **extra):
    score, risk = _viability(inv_max, be_max, royalty, beginner, complexity, brand_type)
    return {
        "name": name, "category": category, "brand_type": brand_type,
        "short_description": desc, "outlet_format": outlet,
        "investment_min": inv_min, "investment_max": inv_max,
        "franchise_fee_display": fee_display, "franchise_fee_numeric": fee_num,
        "royalty_level": royalty, "royalty_pct": royalty_pct,
        "setup_includes": ["Equipment", "Branding", "Training"],
        "min_area_sqft": area_min, "max_area_sqft": area_max,
        "best_chennai_zones": zones, "rent_sensitivity": rent_sens,
        "footfall_dependency": footfall, "staff_required": staff,
        "training_provided": True, "operational_complexity": complexity,
        "beginner_friendly": beginner,
        "expected_revenue_min": rev_min, "expected_revenue_max": rev_max,
        "breakeven_months_min": be_min, "breakeven_months_max": be_max,
        "viability_score": score, "risk_level": risk,
        "is_active": True, "created_by": "system",
        **extra
    }


FRANCHISE_DATA = [

    # ─── TEA & COFFEE ──────────────────────────────────────────────────────────
    _f("Tea Boy", "Tea & Coffee", "Regional",
       "Authentic tea specialist with premium heritage blends, high-volume kiosk model popular in IT corridors and college zones.",
       "Kiosk", 400000, 600000, "Included (₹2.49L+GST)", 249000,
       "None", 0, 200, 300, ["OMR/IT Corridor", "Colleges", "South Chennai"],
       "High", "High", "2-3", "Low-Medium", True, 180000, 300000, 4, 12),

    _f("Chai Kings", "Tea & Coffee", "National",
       "High-volume chain offering over 40 chai varieties with consistent quality and zero royalty for franchisees.",
       "Kiosk/Small Café", 500000, 1200000, "₹2-3L", 200000,
       "None", 0, 100, 250, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-3", "Low", True, 150000, 400000, 10, 14),

    _f("Tea Bench", "Tea & Coffee", "Regional",
       "Budget-friendly kiosk franchise with quick setup and no royalty — ideal first franchise for beginners.",
       "Kiosk", 250000, 550000, "Included", 0,
       "None", 0, 100, 200, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-3", "Low", True, 150000, 400000, 10, 12),

    _f("Chai Waale", "Tea & Coffee", "National",
       "Premium chai café brand with strong brand identity, offering 50+ varieties of specialty teas and snacks.",
       "Small Café", 1200000, 2500000, "₹3-5L", 350000,
       "Medium", 8, 100, 500, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-4", "Low", True, 300000, 700000, 14, 22),

    _f("Ram's Tea House", "Tea & Coffee", "Regional",
       "Traditional South Indian tea brand with a heritage touch, popular for filter coffee and masala chai.",
       "Kiosk/Small Shop", 300000, 500000, "₹3-3.25L", 300000,
       "Low", 5, 100, 150, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-3", "Low", True, 150000, 300000, 6, 10),

    _f("Aaladipattiyan", "Tea & Coffee", "Regional",
       "Karupatti (palm jaggery) tea specialist — healthy alternative drinks concept growing rapidly in Chennai.",
       "Kiosk/Small Shop", 500000, 700000, "₹1.5-3L", 150000,
       "None", 0, 150, 300, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "Medium", "High", "2-5", "Low-Medium", True, 100000, 150000, 6, 12),

    _f("Madras Coffee", "Tea & Coffee", "Regional",
       "Premium South Indian filter coffee brand bringing authentic Madras café experience to modern formats.",
       "Kiosk/Small Café", 1400000, 1600000, "₹4L+GST", 400000,
       "Medium", 8, 150, 300, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-5", "Low-Medium", True, 300000, 600000, 24, 36),

    _f("Lassi Corner", "Tea & Coffee", "Regional",
       "Refreshing lassi and traditional Indian beverages brand — zero royalty with broad menu appeal.",
       "Kiosk/Small Shop", 500000, 1200000, "Included", 0,
       "None", 0, 100, 400, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "Medium", "High", "2-4", "Low", True, 250000, 600000, 12, 18),

    _f("Tea Junction", "Tea & Coffee", "National",
       "Modern café-style tea brand with standardized operations, premium ambiance and multiple revenue streams.",
       "Small Café", 1500000, 2500000, "₹5L", 500000,
       "Medium", 8, 200, 500, ["Central Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "3-5", "Medium", True, 300000, 600000, 18, 24),

    _f("Starbucks", "Tea & Coffee", "International",
       "World's leading premium coffee chain — high investment but unmatched brand recognition and customer loyalty.",
       "Full Café", 15000000, 30000000, "₹25-50L", 3500000,
       "Low", 6, 500, 1500, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "5-12", "High", False, 2500000, 3000000, 18, 24),

    _f("Cafe Coffee Day", "Tea & Coffee", "National",
       "India's largest café chain with massive brand equity, extensive menu and well-established franchise system.",
       "Full Café", 7000000, 10000000, "₹10L+GST", 1000000,
       "High", 12, 1000, 1500, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "5-6", "High", False, 500000, 1000000, 18, 36),

    _f("Milky Delight Café", "Tea & Coffee", "Regional",
       "Fusion beverage café specializing in milkshakes, cold coffees and chai — low royalty, beginner-friendly.",
       "Kiosk/Small Café", 500000, 1000000, "₹2-4L", 200000,
       "Low", 4, 100, 250, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-4", "Low", True, 200000, 600000, 8, 14),

    _f("Karupatti House", "Tea & Coffee", "Regional",
       "Focused on health-forward palm jaggery beverages — taps into the wellness trend with a premium outlet format.",
       "Small Café", 1200000, 1800000, "₹2-3L", 200000,
       "None", 0, 300, 600, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "3-5", "Medium", True, 300000, 600000, 12, 18),

    _f("Chai Point", "Tea & Coffee", "National",
       "Tech-enabled chai brand with IoT-powered equipment, strong corporate clientele and robust supply chain.",
       "Kiosk/Café", 2500000, 5000000, "Included", 0,
       "Medium", 8, 600, 1200, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "4-6", "Low", True, 500000, 1200000, 18, 24),

    _f("Chaayos", "Tea & Coffee", "National",
       "Customizable chai brand with 1 lakh+ combinations, tech ordering and strong urban millennial audience.",
       "Small Café", 1500000, 3000000, "₹3-5L", 350000,
       "Medium", 10, 300, 600, ["Central Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "3-6", "Medium", False, 400000, 800000, 18, 24),

    _f("Chai Sutta Bar", "Tea & Coffee", "National",
       "Unique kulhad chai concept with strong youth brand, viral social media presence and high recall value.",
       "Small Café", 1600000, 2500000, "₹6-8L", 700000,
       "Low", 5, 200, 400, ["Central Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-4", "Medium", True, 450000, 750000, 12, 18),

    _f("MBA Chaiwala", "Tea & Coffee", "National",
       "Inspirational brand story-driven chai café — popular for its word-of-mouth marketing and beginner-friendly ops.",
       "Small Café", 1500000, 2500000, "₹3-5L", 350000,
       "Medium", 8, 150, 400, ["Central Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-5", "Medium", True, 200000, 500000, 15, 20),

    _f("Hyderabad Irani Chai", "Tea & Coffee", "Regional",
       "Authentic Hyderabadi Irani chai experience with traditional recipes — zero royalty, high demand.",
       "Kiosk/Small Shop", 500000, 1500000, "Included", 0,
       "None", 0, 100, 400, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "Medium", "High", "2-4", "Low", True, 150000, 500000, 6, 10),

    _f("We Chai", "Tea & Coffee", "Local",
       "Simple, low-investment tea kiosk with zero royalty — perfect entry-level franchise for first-timers.",
       "Kiosk", 350000, 500000, "₹1.5-2L", 150000,
       "None", 0, 100, 150, ["Central Chennai"],
       "High", "High", "2-3", "Low", True, 150000, 300000, 10, 14),

    _f("Black Pekoe Tea", "Tea & Coffee", "Regional",
       "Premium single-origin tea brand with an artisanal café experience — zero royalty and eco-forward brand.",
       "Kiosk/Small Café", 250000, 700000, "Included", 0,
       "None", 0, 100, 300, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "Medium", "High", "2-3", "Low", True, 150000, 400000, 6, 12),

    _f("Nalan's Coffee Bar", "Tea & Coffee", "Local",
       "South Indian filter coffee specialist with heritage recipes — very low investment and no royalty.",
       "Kiosk", 350000, 500000, "₹1L", 100000,
       "None", 0, 100, 150, ["Central Chennai"],
       "Medium", "High", "2-3", "Low", True, 150000, 300000, 6, 12),

    _f("Tea Trails", "Tea & Coffee", "National",
       "International-styled premium tea café with 150+ tea varieties and a rich café ambiance.",
       "Full Café", 3000000, 5000000, "₹5-7.6L", 600000,
       "Medium", 8, 250, 1000, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "5-6", "Medium", True, 350000, 650000, 18, 36),

    _f("Irani Nawabs", "Tea & Coffee", "Regional",
       "Affordable Irani chai kiosk with authentic recipes — zero royalty and very low investment.",
       "Kiosk", 250000, 500000, "Included", 0,
       "None", 0, 100, 400, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "Medium", "High", "2-3", "Low", True, 150000, 400000, 10, 18),

    _f("Namma Theneer Kadai", "Tea & Coffee", "Local",
       "Hyperlocal traditional South Indian beverages brand — ultra-low investment, zero royalty, beginner-ideal.",
       "Kiosk", 300000, 500000, "Included", 0,
       "None", 0, 100, 200, ["Central Chennai", "South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-3", "Low", True, 150000, 300000, 10, 14),

    # ─── SHAWARMA / BBQ ────────────────────────────────────────────────────────
    _f("CSK Shawarma", "Shawarma/BBQ", "Regional",
       "Cricket-themed shawarma brand inspired by Chennai Super Kings — strong fan base and youth appeal.",
       "Kiosk/QSR", 500000, 1500000, "₹2-5L", 250000,
       "Low", 5, 100, 250, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-4", "Medium", True, 300000, 600000, 8, 18),

    _f("Ohh My Shawarma", "Shawarma/BBQ", "Regional",
       "Trendy fusion QSR blending Middle Eastern shawarma with Indian and global flavors for the youth market.",
       "Small QSR/Takeaway", 500000, 1000000, "Included", 0,
       "Medium", 8, 150, 250, ["Central Chennai", "South Chennai", "OMR/IT Corridor"],
       "High", "High", "2-4", "Medium", True, 300000, 600000, 10, 16),

    _f("Absolute Shawarma", "Shawarma/BBQ", "National",
       "High-growth QSR chain with authentic Middle Eastern shawarma, diverse menu including BBQ, burgers, momos.",
       "Small QSR/Dine-in", 550000, 1100000, "₹2-2.7L", 220000,
       "Low", 5, 150, 400, ["South Chennai", "OMR/IT Corridor", "Colleges", "IT Corridor"],
       "Medium", "High", "2-4", "Medium", True, 300000, 600000, 10, 14),

    _f("Shawarma Bro", "Shawarma/BBQ", "Local",
       "High-footfall Mediterranean joint famous for Cheesy Jalapeno shawarma served in signature box packs.",
       "Small QSR/Takeaway", 500000, 800000, "₹2-3L", 200000,
       "None", 0, 150, 300, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "2-3", "Medium", True, 200000, 400000, 10, 16),

    _f("Grill Nation", "Shawarma/BBQ", "Regional",
       "Fast-growing QSR chain specializing in authentic live-grill BBQ and premium variety shawarmas.",
       "QSR/Dine-in", 1000000, 2500000, "₹2-5L", 300000,
       "Medium", 8, 200, 500, ["OMR/IT Corridor", "Colleges", "South Chennai"],
       "High", "High", "2-5", "Medium", True, 300000, 800000, 12, 18),

    _f("Desert Shawarma", "Shawarma/BBQ", "Regional",
       "Chennai-born QSR focusing on volume-based sales of Arabian-style shawarma with Indian spice profile.",
       "Small QSR/Kiosk", 600000, 1000000, "₹3-10L", 300000,
       "None", 0, 150, 250, ["OMR/IT Corridor", "Colleges"],
       "High", "High", "2-4", "Medium", True, 300000, 700000, 9, 15),

    _f("Shwarmaa Express", "Shawarma/BBQ", "Regional",
       "High-growth Lebanese-style shawarma QSR with delivery-optimized operations and zero royalty.",
       "Small QSR/Takeaway", 1000000, 1500000, "Included", 0,
       "None", 0, 150, 300, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "Medium", "High", "3-5", "Medium", True, 300000, 600000, 12, 18),

    _f("Ali Baba Shawarma", "Shawarma/BBQ", "Regional",
       "Famous for signature 'Hulk Shawarma' — 'Vera Level' budget-friendly dining with zero royalty.",
       "Small QSR/Takeaway", 300000, 1000000, "Included", 0,
       "None", 0, 150, 300, ["Central Chennai", "South Chennai", "Colleges"],
       "High", "High", "2-4", "Medium", True, 200000, 500000, 10, 14),

    _f("Alhaf Food Court", "Shawarma/BBQ", "Regional",
       "High-traffic Arabic & Chinese eatery renowned for signature Grill Chicken and flavorful shawarma.",
       "Dine-in/Takeaway", 1500000, 2500000, "Medium fee", 400000,
       "Medium", 8, 300, 1000, ["South Chennai", "OMR/IT Corridor", "Colleges"],
       "High", "High", "6-10", "Medium", True, 800000, 1500000, 12, 24),

    _f("Zwarma", "Shawarma/BBQ", "National",
       "Specialized Indo-Lebanese QSR with 25+ shawarma varieties — zero royalty and national brand backing.",
       "Kiosk/QSR", 600000, 1800000, "₹2-3L", 200000,
       "None", 0, 100, 250, ["Central Chennai", "South Chennai", "Colleges"],
       "High", "High", "2-3", "Medium", True, 300000, 500000, 12, 18),

    _f("Grill Nights", "Shawarma/BBQ", "National",
       "High-growth QSR with authentic BBQ and Shawarma — zero royalty and one of India's lowest entry costs.",
       "Street Kiosk/QSR", 100000, 600000, "Included", 0,
       "None", 0, 100, 400, ["OMR/IT Corridor", "South Chennai", "Colleges"],
       "High", "High", "2-4", "Medium", True, 300000, 750000, 5, 8),

    _f("BBQ Mafia", "Shawarma/BBQ", "Regional",
       "High-volume street-style BBQ and shawarma chain — zero royalty, low investment, fast break-even.",
       "Small QSR/Takeaway", 300000, 600000, "Included", 0,
       "None", 0, 100, 150, ["South Chennai", "Colleges"],
       "High", "High", "2-4", "Medium", True, 150000, 400000, 6, 12),

    _f("Grill Nights BBQ", "Shawarma/BBQ", "National",
       "Affordable Middle Eastern and Indian grilled flavors — India's most affordable franchise entry with zero royalty.",
       "Street Kiosk/QSR/Dine-in", 100000, 1000000, "₹1L", 100000,
       "None", 0, 100, 300, ["OMR/IT Corridor", "Colleges", "South Chennai"],
       "Medium", "High", "2-4", "Medium", True, 300000, 500000, 5, 8),

    _f("Shawarma Hut", "Shawarma/BBQ", "National",
       "High-volume low-investment QSR with authentic chicken shawarma and grilled rolls — zero royalty model.",
       "Small QSR/Takeaway", 400000, 700000, "₹50K", 50000,
       "None", 0, 100, 250, ["South Chennai"],
       "High", "High", "2-3", "Medium", True, 200000, 400000, 8, 12),

    _f("BBQ Master", "Shawarma/BBQ", "Regional",
       "Fast-growing QSR known for unique 'Gollape Shawarma' — 25+ shawarma varieties at pocket-friendly prices.",
       "QSR/Takeaway", 1400000, 1600000, "₹3L", 300000,
       "Low", 5, 150, 400, ["South Chennai", "OMR/IT Corridor"],
       "High", "High", "3-5", "Medium", True, 300000, 600000, 12, 18),

    _f("Le Shawarma Kings", "Shawarma/BBQ", "Regional",
       "High-volume QSR known for Special Shawarma Plates and a 'chefless' operational model.",
       "Small QSR/Food Truck", 1000000, 2000000, "₹4L", 400000,
       "Medium", 8, 100, 300, ["South Chennai", "OMR/IT Corridor"],
       "High", "High", "2-4", "Medium", True, 300000, 500000, 12, 18),

    # ─── BIRYANI ───────────────────────────────────────────────────────────────
    _f("SS Hyderabad Biryani", "Biryani", "Regional",
       "Well-established Hyderabadi biryani chain with multiple Chennai outlets — strong brand recall and consistent quality.",
       "Cloud Kitchen/Dine-in", 1000000, 2000000, "₹2-4L", 300000,
       "Low", 5, 200, 600, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Medium", "High", "4-8", "Medium", True, 500000, 1200000, 12, 20),

    _f("Thalapakati Dindigul", "Biryani", "Regional",
       "Iconic Dindigul-style biryani brand using seeraga samba rice — strong heritage and loyal customer base in Chennai.",
       "Dine-in/Takeaway", 2500000, 5000000, "₹5-8L", 600000,
       "Medium", 8, 800, 2000, ["South Chennai", "Central Chennai", "West Chennai"],
       "Medium", "High", "8-15", "High", False, 1000000, 3000000, 18, 30),

    _f("Buhari", "Biryani", "Regional",
       "Chennai's heritage biryani institution with over 70 years of legacy — premium dine-in experience.",
       "Dine-in", 3000000, 6000000, "₹6-10L", 800000,
       "Medium", 8, 1500, 3000, ["Central Chennai", "South Chennai"],
       "Low", "High", "10-20", "High", False, 2000000, 5000000, 24, 36),

    _f("Aasife Biriyani", "Biryani", "Regional",
       "Popular Ambur-style biryani brand known for authentic taste and reasonable pricing — strong loyal fanbase.",
       "Dine-in/Takeaway", 1500000, 3000000, "₹3-5L", 400000,
       "Medium", 8, 500, 1500, ["South Chennai", "Central Chennai"],
       "Medium", "High", "6-12", "Medium", False, 800000, 2000000, 18, 24),

    _f("Junior Kuppanna", "Biryani", "Regional",
       "Kongu-style biryani and authentic Tamil Nadu cuisine — heritage brand with massive brand equity.",
       "Dine-in", 3000000, 5000000, "₹5-8L", 700000,
       "Medium", 8, 1200, 2500, ["South Chennai", "West Chennai", "Outskirts"],
       "Medium", "High", "8-15", "High", False, 1500000, 4000000, 24, 36),

    _f("Toppivappa Biryani", "Biryani", "Local",
       "Budget cloud kitchen model with Ambur-style biryani — low investment, delivery-focused, beginner-friendly.",
       "Cloud Kitchen", 600000, 1200000, "₹1-2L", 100000,
       "Low", 4, 100, 300, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Low", "Medium", "2-3", "Medium", True, 200000, 500000, 10, 18),

    _f("Mani's Dum Biryani", "Biryani", "Local",
       "Traditional dum biryani specialist — cloud kitchen model with very low overhead and zero royalty.",
       "Cloud Kitchen", 500000, 1000000, "Included", 0,
       "None", 0, 100, 200, ["South Chennai", "OMR/IT Corridor"],
       "Low", "Medium", "2-3", "Low-Medium", True, 200000, 400000, 8, 14),

    _f("Star Biryani", "Biryani", "Local",
       "Hyderabadi dum biryani cloud kitchen franchise — ultra-low investment with delivery platform integration.",
       "Cloud Kitchen", 400000, 800000, "Included", 0,
       "None", 0, 100, 200, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Low", "Medium", "2-3", "Low-Medium", True, 150000, 350000, 8, 14),

    _f("Afraaz Biryani", "Biryani", "Local",
       "Authentic Ambur mutton biryani cloud kitchen — low investment, no royalty, strong delivery demand.",
       "Cloud Kitchen", 400000, 700000, "Included", 0,
       "None", 0, 100, 200, ["South Chennai", "OMR/IT Corridor"],
       "Low", "Medium", "2-3", "Low-Medium", True, 150000, 300000, 8, 14),

    _f("Salem RR Biryani", "Biryani", "Regional",
       "Premium Salem-style biryani brand with FOCO (Franchise Owned Company Operated) model — passive income opportunity.",
       "Dine-in/Takeaway", 2000000, 3500000, "₹4-6L", 500000,
       "Medium", 8, 500, 1500, ["South Chennai", "West Chennai", "Outskirts"],
       "Medium", "High", "5-10", "Medium", True, 800000, 2000000, 18, 30),

    _f("Behrouz Biryani", "Biryani", "National",
       "Royal Mughal-inspired biryani brand — premium cloud kitchen concept with massive delivery platform presence.",
       "Cloud Kitchen", 500000, 1200000, "₹2-3L", 200000,
       "Low", 5, 200, 400, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Low", "Medium", "3-5", "Medium", True, 400000, 900000, 10, 18),

    _f("Mandi Raja", "Biryani", "Regional",
       "Arabian Mandi rice and BBQ specialist — unique cuisine niche with high average ticket value.",
       "Dine-in", 2000000, 4000000, "₹4-7L", 500000,
       "Medium", 8, 800, 2000, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Medium", "High", "8-15", "High", False, 1000000, 3000000, 18, 28),

    _f("Appu Kadai Biryani", "Biryani", "Local",
       "Heritage Tamil Nadu biryani takeaway brand — loyal local following and low operational complexity.",
       "Takeaway", 800000, 1500000, "₹1.5-2.5L", 150000,
       "Low", 4, 200, 400, ["Central Chennai", "South Chennai"],
       "Medium", "High", "3-5", "Medium", True, 300000, 700000, 12, 18),

    _f("Bai Biriyani", "Biryani", "Local",
       "Bucket biryani concept — viral format with high shareability, low investment and delivery-first model.",
       "Cloud Kitchen", 600000, 1000000, "₹1-2L", 100000,
       "None", 0, 100, 200, ["South Chennai", "OMR/IT Corridor"],
       "Low", "Medium", "2-3", "Low-Medium", True, 200000, 400000, 10, 16),

    _f("Paradise Biryani", "Biryani", "National",
       "Iconic Hyderabadi biryani institution from Hyderabad — national brand with high quality standards.",
       "Dine-in", 3000000, 6000000, "₹5-10L", 700000,
       "Medium", 8, 1500, 3000, ["Central Chennai", "South Chennai"],
       "Low", "High", "10-20", "High", False, 2000000, 5000000, 24, 36),

    _f("Ammi's Biryani", "Biryani", "Regional",
       "Home-style biryani brand with authentic recipes — growing cloud kitchen model with strong delivery presence.",
       "Cloud Kitchen", 600000, 1200000, "₹1.5-2.5L", 150000,
       "Low", 5, 200, 400, ["South Chennai", "OMR/IT Corridor"],
       "Low", "Medium", "2-4", "Medium", True, 250000, 600000, 10, 16),

    # ─── PHARMACY ──────────────────────────────────────────────────────────────
    _f("Janaushadhi", "Pharmacy", "National",
       "Government-backed generic medicine store — low investment, no royalty, massive social good positioning.",
       "Retail Store", 500000, 1000000, "₹83K+GST", 83000,
       "None", 0, 150, 350, ["Central Chennai", "North Chennai", "West Chennai", "Outskirts"],
       "Low", "Medium", "2-3", "Low", True, 100000, 300000, 12, 18),

    _f("Medkart", "Pharmacy", "National",
       "Discount generic pharmacy chain — savings-focused brand with tech-enabled prescription management.",
       "Retail Store", 1000000, 2000000, "₹39.85K+GST", 39850,
       "Low", 3, 200, 400, ["Central Chennai", "South Chennai", "West Chennai", "Outskirts"],
       "Medium", "Medium", "2-4", "Low-Medium", True, 200000, 500000, 18, 24),

    _f("Apollo Pharmacy", "Pharmacy", "National",
       "India's largest pharmacy chain — unmatched brand trust, strong supply chain and loyal customer base.",
       "Retail Store", 3000000, 6000000, "₹5-10L", 750000,
       "Low", 4, 400, 1200, ["South Chennai", "OMR/IT Corridor", "Central Chennai", "West Chennai"],
       "High", "High", "5-8", "Medium", True, 600000, 1500000, 24, 36),

    _f("Wellness Forever", "Pharmacy", "National",
       "Tech-forward branded pharmacy with wide wellness product range — premium store experience and strong margins.",
       "Retail Store", 3000000, 6000000, "₹5L", 500000,
       "Medium", 6, 500, 1200, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "5-8", "Medium", True, 600000, 1500000, 24, 36),

    _f("Frank Ross Pharmacy", "Pharmacy", "Regional",
       "Trusted branded pharmacy chain with zero royalty model — strong regional brand across South India.",
       "Retail Store", 2000000, 3000000, "₹3-5L", 400000,
       "None", 0, 400, 800, ["South Chennai", "Central Chennai", "West Chennai"],
       "High", "High", "4-6", "Medium", True, 400000, 1000000, 18, 24),

    _f("MedPlus", "Pharmacy", "National",
       "Fast-growing pharmacy chain with 4,000+ stores — strong IT-enabled inventory and customer loyalty program.",
       "Retail Store", 4000000, 7000000, "₹5-8L", 600000,
       "Low", 4, 400, 1000, ["South Chennai", "OMR/IT Corridor", "Central Chennai", "West Chennai"],
       "High", "High", "5-8", "Medium", True, 700000, 1800000, 24, 36),

    _f("Genericplus Pharmacy", "Pharmacy", "National",
       "Discount-focused generic pharmacy with aggressive pricing — high royalty offset by very high volume sales.",
       "Retail Store", 3000000, 5000000, "₹5-8L", 600000,
       "High", 50, 300, 800, ["Central Chennai", "North Chennai", "Outskirts"],
       "Medium", "Medium", "4-6", "Medium", False, 500000, 1200000, 24, 36),

    _f("Medspres", "Pharmacy", "National",
       "Generic medicine pharmacy with zero royalty — growing chain focused on affordable healthcare access.",
       "Retail Store", 1000000, 2500000, "₹2-4L", 250000,
       "None", 0, 200, 500, ["Central Chennai", "South Chennai", "Outskirts"],
       "Medium", "Medium", "2-4", "Low-Medium", True, 200000, 500000, 18, 24),

    _f("Guardian Pharmacy", "Pharmacy", "National",
       "Premium branded pharmacy with wellness and healthcare products — strong brand presence in organized retail.",
       "Retail Store", 3500000, 6000000, "₹5-8L", 600000,
       "Low", 4, 500, 1200, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "5-8", "Medium", True, 600000, 1500000, 24, 36),

    _f("1mg Pharmacy", "Pharmacy", "National",
       "Digital-first pharmacy brand (now Tata-backed) — tech platform integration with offline retail.",
       "Retail Store", 2000000, 4000000, "₹4-6L", 500000,
       "Medium", 6, 400, 800, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "4-6", "Medium", True, 500000, 1200000, 18, 30),

    # ─── SALON ─────────────────────────────────────────────────────────────────
    _f("Greentrends", "Salon", "National",
       "India's largest unisex salon franchise (1500+ outlets) — proven system, low royalty, high brand recall.",
       "Unisex Salon", 1000000, 2000000, "₹3-5L", 400000,
       "Low", 6, 400, 800, ["South Chennai", "OMR/IT Corridor", "Central Chennai", "West Chennai"],
       "High", "High", "5-8", "Medium", True, 300000, 800000, 12, 20),

    _f("Naturals Salon", "Salon", "National",
       "Premium unisex salon chain with 700+ outlets — strong brand and comprehensive training for franchisees.",
       "Unisex Salon", 2000000, 4000000, "₹5-8L", 600000,
       "Medium", 8, 600, 1200, ["South Chennai", "OMR/IT Corridor", "Central Chennai", "West Chennai"],
       "High", "High", "6-10", "Medium", True, 400000, 1000000, 18, 24),

    _f("Lakmé Salon", "Salon", "National",
       "India's most iconic beauty brand (HUL) — premium positioning with unmatched brand equity in beauty.",
       "Unisex Salon", 3000000, 6000000, "₹8-12L", 1000000,
       "Medium", 8, 800, 1500, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "6-10", "Medium", False, 600000, 1500000, 24, 36),

    _f("Jawed Habib", "Salon", "National",
       "Celebrity stylist-backed franchise — strong pull for quality-conscious urban customers.",
       "Unisex Salon", 1500000, 3000000, "₹5-8L", 600000,
       "Medium", 10, 400, 800, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "5-8", "Medium", True, 400000, 900000, 18, 24),

    _f("VLCC", "Salon", "National",
       "Wellness and beauty brand combining salon, slimming and skincare — high revenue potential per customer.",
       "Wellness Salon", 3000000, 6000000, "₹8-12L", 1000000,
       "Medium", 8, 1000, 2000, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "6-10", "High", False, 700000, 1800000, 24, 36),

    _f("YLG Salon", "Salon", "National",
       "Women-focused premium salon with 250+ outlets — strong loyalty program and high customer retention.",
       "Ladies Salon", 1500000, 3000000, "₹4-6L", 500000,
       "Medium", 8, 500, 1000, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "4-6", "Medium", True, 400000, 900000, 18, 24),

    _f("Toni & Guy", "Salon", "International",
       "Global premium salon brand — luxury positioning with international training and high average ticket value.",
       "Premium Salon", 8000000, 15000000, "₹15-25L", 2000000,
       "Medium", 10, 1000, 2000, ["South Chennai", "OMR/IT Corridor"],
       "Medium", "Medium", "8-15", "High", False, 1000000, 3000000, 24, 36),

    _f("Swagmee Salon", "Salon", "Regional",
       "Affordable unisex salon franchise with very low entry cost — beginner-friendly with zero skill requirement.",
       "Unisex Salon", 500000, 800000, "₹1-2L", 100000,
       "Low", 5, 200, 400, ["South Chennai", "OMR/IT Corridor", "Central Chennai", "West Chennai", "North Chennai"],
       "Medium", "High", "3-4", "Low-Medium", True, 150000, 350000, 10, 18),

    _f("Style n Scissors", "Salon", "Regional",
       "Affordable mid-range unisex salon chain in Chennai — hyperlocal brand with strong repeat customer base.",
       "Unisex Salon", 800000, 1500000, "₹2-3L", 200000,
       "Low", 5, 300, 600, ["South Chennai", "Central Chennai", "West Chennai"],
       "Medium", "High", "4-6", "Medium", True, 200000, 500000, 12, 18),

    _f("Enrich Salons", "Salon", "National",
       "Premium unisex salon chain with 100+ outlets — high NPS scores and strong training infrastructure.",
       "Premium Salon", 2000000, 5000000, "₹6-10L", 800000,
       "Medium", 8, 600, 1200, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "High", "High", "6-10", "Medium", True, 500000, 1200000, 24, 36),

    _f("Looks Salon", "Salon", "National",
       "Value-for-money unisex salon with pan-India presence — consistent service quality and beginner-friendly ops.",
       "Unisex Salon", 1200000, 2500000, "₹3-5L", 350000,
       "Low", 6, 400, 800, ["South Chennai", "OMR/IT Corridor", "Central Chennai", "West Chennai"],
       "High", "High", "5-8", "Medium", True, 250000, 600000, 15, 22),

    # ─── CAR CARE ──────────────────────────────────────────────────────────────
    _f("Hoora Car Wash", "Car Care", "National",
       "Tech-driven doorstep auto-care using portable 'PowerKits' — zero land requirement, very low investment.",
       "Mobile/Doorstep", 400000, 800000, "Included", 0,
       "Medium", 10, 0, 0, ["South Chennai", "OMR/IT Corridor"],
       "Low", "Low", "1-2", "Low-Medium", True, 35000, 50000, 6, 8),

    _f("My Bike Wash", "Car Care", "National",
       "Eco-friendly automated bike wash with 90% water-saving technology — low investment, recurring revenue.",
       "Automated Station", 500000, 1000000, "₹50K-1L", 75000,
       "Low", 8, 150, 300, ["OMR/IT Corridor", "North Chennai", "West Chennai"],
       "Medium", "High", "2-3", "Low", True, 100000, 200000, 8, 12),

    _f("DM Car Care", "Car Care", "National",
       "ISO 9001-certified premium detailing studio with zero royalty — fast 6-month break-even period.",
       "Detailing Studio", 1000000, 3600000, "₹1.5L", 150000,
       "None", 0, 1000, 1000, ["OMR/IT Corridor", "South Chennai", "Central Chennai"],
       "Medium", "Medium", "4-8", "Medium", True, 200000, 500000, 6, 12),

    _f("Dynamic Motors", "Car Care", "National",
       "Engine carbon cleaning + premium detailing — zero royalty franchise with industry-leading 6-month ROI.",
       "Service Center", 1200000, 3600000, "₹12L", 1200000,
       "None", 0, 500, 1500, ["OMR/IT Corridor", "South Chennai", "Central Chennai"],
       "Medium", "Medium", "3-6", "Medium", True, 300000, 500000, 6, 12),

    _f("CarzSpa", "Car Care", "National",
       "Premium detailing studio with ceramic coatings and PPF — zero royalty, appointment-based high-margin model.",
       "Detailing Studio", 1800000, 4500000, "Included", 0,
       "None", 0, 1000, 2500, ["South Chennai", "OMR/IT Corridor"],
       "Medium", "Medium", "5-8", "Medium", True, 500000, 1200000, 12, 18),

    _f("Door2Door Car Wash", "Car Care", "National",
       "100% mobile car wash service — zero land requirement, water-efficient and perfect for urban professionals.",
       "Mobile Service", 300000, 1500000, "₹1-2L", 150000,
       "Low", 2000, 0, 0, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Low", "Low", "2-4", "Low-Medium", True, 150000, 200000, 8, 12),

    _f("The Detailing Gang", "Car Care", "National",
       "Premium detailing studio with live-streaming services — transparency-focused, appointment-based model.",
       "Detailing Studio", 2000000, 6000000, "₹5-10L", 750000,
       "Low", 5, 700, 1500, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Medium", "Medium", "4-8", "Medium", True, 600000, 1000000, 12, 24),

    _f("Speed Car Wash", "Car Care", "National",
       "Organized mechanized car wash system — brings professional standards to the unorganized segment.",
       "Car Wash Center", 1500000, 4000000, "₹1.75-5L", 300000,
       "None", 0, 500, 2000, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Medium", "Medium", "5-10", "Medium", True, 100000, 125000, 12, 15),

    _f("AUTOZ SPA", "Car Care", "National",
       "Eco-friendly steam car wash with high-margin professional detailing — low investment, established brand.",
       "Service Center", 1000000, 1200000, "Low", 50000,
       "Medium", 10, 500, 1500, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Medium", "Medium", "5-7", "Medium", True, 150000, 300000, 12, 18),

    _f("Paggico.com", "Car Care", "National",
       "Tech-driven 360-degree car care with doorstep service — multi-channel revenue (walk-in + mobile).",
       "Hybrid Service", 275000, 4500000, "3-5%", 0,
       "Medium", 4, 500, 2000, ["South Chennai", "OMR/IT Corridor"],
       "Medium", "Medium", "2-3", "Medium", True, 180000, 450000, 9, 11),

    _f("CAR-O-MAN", "Car Care", "Regional",
       "Tech-driven multi-brand workshop with 'dealership-quality at local price' — transparent digital billing.",
       "Workshop", 1500000, 3000000, "₹3-5L", 400000,
       "Low", 6, 1500, 3000, ["South Chennai", "OMR/IT Corridor"],
       "Medium", "Medium", "5-8", "Medium", False, 400000, 800000, 18, 24),

    _f("Detailing Mafia", "Car Care", "National",
       "Premium detailing with PPF and ceramic coatings — luxury studio aesthetic, high-margin services.",
       "Premium Studio", 2500000, 4500000, "Included", 0,
       "Low", 8, 1200, 2500, ["South Chennai", "OMR/IT Corridor", "Central Chennai"],
       "Medium", "Medium", "6-10", "Medium", True, 800000, 1800000, 18, 24),

    _f("Doctor Garage", "Car Care", "National",
       "Standardized two-wheeler service chain with doorstep pickup and tech-enabled maintenance.",
       "Bike Service", 600000, 1000000, "₹1L", 100000,
       "Low", 10, 300, 500, ["OMR/IT Corridor", "South Chennai"],
       "Medium", "Medium", "3-5", "Medium", True, 300000, 400000, 9, 12),

    _f("Zixdo Car Wash", "Car Care", "National",
       "Tech-driven platform with doorstep wash + 24/7 automated self-service stations using Russian technology.",
       "Hybrid/Automated", 200000, 5000000, "₹1-1.54L", 100000,
       "High", 30, 300, 6000, ["OMR/IT Corridor", "South Chennai", "Central Chennai"],
       "Low", "Medium", "2-8", "Low-Medium", True, 600000, 1000000, 12, 24),

]
