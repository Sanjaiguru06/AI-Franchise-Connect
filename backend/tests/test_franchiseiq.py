"""FranchiseIQ Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def seeker_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "seeker@test.com", "password": "test123"})
    if r.status_code == 200:
        return r.json()["token"]
    # Try registering
    r2 = requests.post(f"{BASE_URL}/api/auth/register", json={"name": "Seeker", "email": "seeker@test.com", "password": "test123", "role": "seeker"})
    if r2.status_code == 200:
        return r2.json()["token"]
    pytest.skip("Could not get seeker token")

@pytest.fixture(scope="module")
def owner_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "owner@test.com", "password": "test123"})
    if r.status_code == 200:
        return r.json()["token"]
    r2 = requests.post(f"{BASE_URL}/api/auth/register", json={"name": "Owner", "email": "owner@test.com", "password": "test123", "role": "owner"})
    if r2.status_code == 200:
        return r2.json()["token"]
    pytest.skip("Could not get owner token")

@pytest.fixture(scope="module")
def franchise_id():
    r = requests.get(f"{BASE_URL}/api/franchises", params={"limit": 1})
    assert r.status_code == 200
    items = r.json()["franchises"]
    assert len(items) > 0
    return items[0]["franchise_id"]

# Auth tests
class TestAuth:
    def test_register_duplicate_fails(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"name": "Dup", "email": "seeker@test.com", "password": "test123", "role": "seeker"})
        assert r.status_code == 400

    def test_login_seeker(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "seeker@test.com", "password": "test123"})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d
        assert d["role"] == "seeker"

    def test_login_owner(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "owner@test.com", "password": "test123"})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d
        assert d["role"] == "owner"

    def test_login_invalid_fails(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "bad@test.com", "password": "wrong"})
        assert r.status_code == 401

    def test_profile(self, seeker_token):
        r = requests.get(f"{BASE_URL}/api/auth/profile", headers={"Authorization": f"Bearer {seeker_token}"})
        assert r.status_code == 200
        assert "email" in r.json()

# Franchise tests
class TestFranchises:
    def test_list_franchises(self):
        r = requests.get(f"{BASE_URL}/api/franchises")
        assert r.status_code == 200
        d = r.json()
        assert "franchises" in d
        assert d["total"] >= 91

    def test_list_with_category(self):
        r = requests.get(f"{BASE_URL}/api/franchises", params={"category": "Tea & Coffee"})
        assert r.status_code == 200
        items = r.json()["franchises"]
        assert len(items) > 0
        for item in items:
            assert item["category"] == "Tea & Coffee"

    def test_list_with_search(self):
        r = requests.get(f"{BASE_URL}/api/franchises", params={"search": "chai"})
        assert r.status_code == 200

    def test_list_with_budget(self):
        r = requests.get(f"{BASE_URL}/api/franchises", params={"investment_max": 1500000})
        assert r.status_code == 200

    def test_get_franchise(self, franchise_id):
        r = requests.get(f"{BASE_URL}/api/franchises/{franchise_id}")
        assert r.status_code == 200
        d = r.json()
        assert "franchise_id" in d
        assert "name" in d
        assert "viability_score" in d

    def test_get_categories(self):
        r = requests.get(f"{BASE_URL}/api/franchises/categories")
        assert r.status_code == 200
        cats = r.json()["categories"]
        assert len(cats) >= 6

    def test_owner_mine(self, owner_token):
        r = requests.get(f"{BASE_URL}/api/franchises/mine", headers={"Authorization": f"Bearer {owner_token}"})
        assert r.status_code == 200

    def test_seeker_cannot_access_mine(self, seeker_token):
        r = requests.get(f"{BASE_URL}/api/franchises/mine", headers={"Authorization": f"Bearer {seeker_token}"})
        assert r.status_code == 403

# AI tests
class TestAI:
    def test_ai_match(self, seeker_token):
        r = requests.post(f"{BASE_URL}/api/ai/match",
            headers={"Authorization": f"Bearer {seeker_token}"},
            json={"budget": "5L_15L", "zone": "south_omr", "experience": "none", "risk": "low", "categories": ["Tea & Coffee"]})
        assert r.status_code == 200
        d = r.json()
        assert "recommendations" in d
        assert len(d["recommendations"]) > 0

    def test_ai_chat(self, seeker_token, franchise_id):
        r = requests.post(f"{BASE_URL}/api/ai/chat",
            headers={"Authorization": f"Bearer {seeker_token}"},
            json={"franchise_id": franchise_id, "message": "What is the investment required?"})
        assert r.status_code == 200
        d = r.json()
        assert "response" in d
        assert len(d["response"]) > 0

    def test_ai_roadmap(self, seeker_token, franchise_id):
        r = requests.post(f"{BASE_URL}/api/ai/roadmap",
            headers={"Authorization": f"Bearer {seeker_token}"},
            json={"franchise_id": franchise_id, "zone": "South Chennai", "experience": "none"})
        assert r.status_code == 200
        d = r.json()
        assert "steps" in d

    def test_ai_compare(self, seeker_token):
        r = requests.get(f"{BASE_URL}/api/franchises", params={"limit": 2})
        ids = [f["franchise_id"] for f in r.json()["franchises"][:2]]
        r2 = requests.post(f"{BASE_URL}/api/ai/compare-insight",
            headers={"Authorization": f"Bearer {seeker_token}"},
            json={"franchise_ids": ids})
        assert r2.status_code == 200
        d = r2.json()
        assert "verdict" in d

# Location tests
class TestLocation:
    def test_location_intelligence(self):
        r = requests.get(f"{BASE_URL}/api/location/intelligence")
        assert r.status_code == 200
        d = r.json()
        assert "zones" in d
        assert "insights" in d

    def test_zones(self):
        r = requests.get(f"{BASE_URL}/api/location/zones")
        assert r.status_code == 200
        assert len(r.json()["zones"]) == 5

# Owner CRUD
class TestOwnerCRUD:
    created_fid = None

    def test_create_franchise(self, owner_token):
        payload = {
            "name": "TEST_Chai Point", "category": "Tea & Coffee", "brand_type": "Semi-Premium",
            "short_description": "Test chai franchise", "outlet_format": "Kiosk",
            "investment_min": 500000, "investment_max": 1500000,
            "franchise_fee_display": "₹2L", "royalty_level": "Low", "royalty_pct": 5.0,
            "min_area_sqft": 150, "max_area_sqft": 300,
            "best_chennai_zones": ["South Chennai"], "rent_sensitivity": "Medium",
            "footfall_dependency": "High", "staff_required": "3-5",
            "operational_complexity": "Simple", "beginner_friendly": True,
            "expected_revenue_min": 200000, "expected_revenue_max": 400000,
            "breakeven_months_min": 12, "breakeven_months_max": 18
        }
        r = requests.post(f"{BASE_URL}/api/franchises/",
            headers={"Authorization": f"Bearer {owner_token}"},
            json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "TEST_Chai Point"
        TestOwnerCRUD.created_fid = d["franchise_id"]

    def test_verify_created_franchise(self):
        if not TestOwnerCRUD.created_fid:
            pytest.skip("No franchise created")
        r = requests.get(f"{BASE_URL}/api/franchises/{TestOwnerCRUD.created_fid}")
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Chai Point"

    def test_delete_created_franchise(self, owner_token):
        if not TestOwnerCRUD.created_fid:
            pytest.skip("No franchise created")
        r = requests.delete(f"{BASE_URL}/api/franchises/{TestOwnerCRUD.created_fid}",
            headers={"Authorization": f"Bearer {owner_token}"})
        assert r.status_code == 200
