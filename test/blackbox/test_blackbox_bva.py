import pytest
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Equivalence Partitioning & Boundary Value Analysis tests
# Focus: Testing /auth/register and /auth/login based on input boundaries.

def test_register_invalid_email_ep():
    # Equivalence Class: Invalid emails (missing @, or domain)
    payload = {"email": "invalid-email-format", "full_name": "Test User", "password": "TestPass@123"}
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    # Expected validation error from pydantic (EmailStr)
    assert response.status_code == 422 

def test_register_missing_fields_ep():
    # Equivalence Class: Missing required fields
    payload = {"email": "test@example.com"} # no password, no full_name
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 422

def test_login_bva_invalid_credentials():
    # Equivalence Class: Invalid combination
    payload = {"email": "test@example.com", "password": "wrongpassword"}
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert response.status_code in [400, 401] # Depends on exact backend implementation (401 Unauthorized or 400 Bad Request)

def test_product_creation_bva_negative_price():
    # Boundary Value Analysis: Unit price must not be typically negative (assuming validation)
    # This requires a logged-in user, we'll mock or just expect 401 if unauthorized, but if we had auth token:
    payload = {
        "sku": "BVA-SKU-1",
        "name": "BVA Product",
        "unit_price": -5.00,  # Below boundary test
        "low_stock_threshold": 10
    }
    # For now we just test the unauthorized boundary
    response = requests.post(f"{BASE_URL}/products", json=payload)
    assert response.status_code == 401 # No token

