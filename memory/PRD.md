# FranchiseIQ — PRD

## Problem Statement
Build an AI-powered Franchise Discovery & Decision Intelligence Platform for Chennai. Not just a directory — a guided advisor that takes franchise seekers from readiness check → AI match → viability score → AI explainer → roadmap. Franchise owners can register their listings.

## Architecture
- **Frontend**: React 18, React Router v6, Axios, @phosphor-icons/react
- **Backend**: FastAPI, Motor (async MongoDB), bcrypt, PyJWT, Groq AI
- **Database**: MongoDB (franchise_platform)
- **AI**: Groq API (llama-3.3-70b-versatile) — matching, chat, roadmap, compare insight

## Data
- 91 franchises seeded across 6 categories:
  - Tea & Coffee (24), Shawarma/BBQ (15), Biryani (15), Pharmacy (10), Salon (11), Car Care (16)
- Each franchise has 25+ fields: investment, breakeven, royalty, zones, viability score, risk level

## Core Requirements (Static)
1. JWT auth with seeker/owner roles
2. AI franchise matching (quiz → Groq AI → ranked results with % scores)
3. Viability Score (0–100, Safe/Moderate/Risk) — algorithmic
4. AI Explainer chat per franchise (Groq, session-based)
5. AI Roadmap generation (Groq, 7-step personalized)
6. Side-by-side comparison with AI verdict
7. Chennai zone intelligence (demand vs saturation)
8. Owner franchise listing management

## What's Been Implemented (2024-01)

### Backend (server.py + franchise_data.py)
- [x] JWT auth: register, login, profile (seeker + owner roles)
- [x] Franchise CRUD: list with filters, get by ID, create (owner), update, soft-delete
- [x] AI match endpoint: quiz → filter → Groq ranking
- [x] AI chat endpoint: session-based franchise explainer
- [x] AI roadmap endpoint: 7-step personalized plan
- [x] AI compare insight: verdict + best picks
- [x] Location intelligence: 5 Chennai zones with demand/saturation data
- [x] Startup seeding: 91 franchises auto-seeded on first run
- [x] redirect_slashes=False on all routers

### Frontend (React)
- [x] Landing page: hero, stats, how-it-works, categories, why-us, CTA
- [x] Auth: login/register with role selection (seeker/owner)
- [x] Quiz: 5-step readiness wizard (budget/zone/experience/risk/categories)
- [x] Recommendations: AI-ranked cards with match%, sort options, compare selection
- [x] Browse: all franchises with search, category tabs, budget/risk/beginner filters
- [x] Franchise Detail: full info tabs, viability gauge, AI chat panel with quick questions
- [x] Compare: side-by-side table with best/worst highlights + AI verdict
- [x] Roadmap: AI-generated 7-step plan with checkable progress (localStorage)
- [x] Location Intelligence: Chennai zone matrix, demand vs saturation charts
- [x] Owner Dashboard: listing management (view/edit/delete)
- [x] Add/Edit Franchise: 4-step form with viability auto-calculation

## Prioritized Backlog

### P0 (Critical)
- None outstanding — all core flows working

### P1 (High Priority / Next Sprint)
- Compare: persist selections in localStorage (currently React memory only)
- Quiz history: expose GET /api/quiz-results for user history
- Saved franchises: bookmark/save franchise for later
- More franchise data: 40+ more brands from source documents

### P2 (Nice to Have)
- Email notifications (Resend) when franchise gets inquiries
- Owner analytics: views, inquiries, CTR per listing  
- Franchise comparison PDF export
- User profile page with quiz history + saved franchises

## Test Credentials
- Seeker: seeker@test.com / test123
- Owner: owner@test.com / test123
