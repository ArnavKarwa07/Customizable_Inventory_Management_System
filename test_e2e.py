#!/usr/bin/env python3
"""
End-to-end test for the Inventory Management System
Tests complete workflow: Register → Login → Create Product → Create Warehouse → Create Order
"""

import json
import sys
import time
from datetime import datetime

import requests

BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 5

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def log_success(message):
    print(f"{GREEN}✓ {message}{RESET}")


def log_error(message):
    print(f"{RED}✗ {message}{RESET}")


def log_info(message):
    print(f"{YELLOW}ℹ {message}{RESET}")


def test_health_check():
    """Test if backend is running"""
    log_info("Testing backend health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            log_success("Backend is running")
            return True
        else:
            log_error(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        log_error(f"Cannot connect to backend: {e}")
        return False


def test_register():
    """Test user registration"""
    log_info("Testing registration...")
    email = f"testuser_{int(time.time())}@example.com"
    payload = {"email": email, "full_name": "Test User", "password": "TestPass@123"}

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
        if response.status_code == 201:
            log_success(f"Registration successful: {email}")
            return email, payload["password"]
        else:
            log_error(f"Registration failed: {response.json()}")
            return None, None
    except Exception as e:
        log_error(f"Registration error: {e}")
        return None, None


def test_login(email, password):
    """Test user login"""
    log_info("Testing login...")
    payload = {"email": email, "password": password}

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            access_token = data.get("access_token")
            log_success(f"Login successful")
            return access_token
        else:
            log_error(f"Login failed: {response.json()}")
            return None
    except Exception as e:
        log_error(f"Login error: {e}")
        return None


def make_request(method, endpoint, token, data=None):
    """Helper to make authenticated requests"""
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BASE_URL}{endpoint}"

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=TIMEOUT)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers, timeout=TIMEOUT)
        else:
            return None

        return response
    except Exception as e:
        log_error(f"Request error: {e}")
        return None


def test_get_profile(token):
    """Test getting user profile"""
    log_info("Testing get user profile...")
    response = make_request("GET", "/users/me", token)

    if response and response.status_code == 200:
        user = response.json()
        log_success(f"Profile loaded: {user.get('full_name')} ({user.get('email')})")
        return user
    else:
        log_error(f"Failed to get profile: {response.status_code if response else 'No response'}")
        return None


def test_create_product(token):
    """Test creating a product"""
    log_info("Testing create product...")
    payload = {"sku": f"SKU-{int(time.time())}", "name": "Test Product", "unit_price": 99.99, "low_stock_threshold": 5}
    response = make_request("POST", "/products", token, payload)

    if response and response.status_code == 201:
        product = response.json()
        log_success(f"Product created: {product.get('name')} (ID: {product.get('id')})")
        return product
    else:
        log_error(f"Create product failed: {response.status_code if response else 'No response'}")
        return None


def test_list_products(token):
    """Test listing products"""
    log_info("Testing list products...")
    response = make_request("GET", "/products", token)

    if response and response.status_code == 200:
        products = response.json()
        log_success(f"Listed {len(products)} product(s)")
        return products
    else:
        log_error(f"List products failed: {response.status_code if response else 'No response'}")
        return None


def test_create_warehouse(token):
    """Test creating a warehouse"""
    log_info("Testing create warehouse...")
    payload = {"name": f"Warehouse {int(time.time())}", "code": f"WH-{int(time.time()) % 10000}", "address": "123 Main St"}
    response = make_request("POST", "/warehouses", token, payload)

    if response and response.status_code == 201:
        warehouse = response.json()
        log_success(f"Warehouse created: {warehouse.get('name')} (ID: {warehouse.get('id')})")
        return warehouse
    else:
        log_error(f"Create warehouse failed: {response.status_code if response else 'No response'}")
        return None


def test_list_warehouses(token):
    """Test listing warehouses"""
    log_info("Testing list warehouses...")
    response = make_request("GET", "/warehouses", token)

    if response and response.status_code == 200:
        warehouses = response.json()
        log_success(f"Listed {len(warehouses)} warehouse(s)")
        return warehouses
    else:
        log_error(f"List warehouses failed: {response.status_code if response else 'No response'}")
        return None


def test_create_order(token, warehouse_id, product_id):
    """Test creating an order"""
    log_info("Testing create order...")
    payload = {"warehouse_id": warehouse_id, "items": [{"product_id": product_id, "quantity": 10}]}
    response = make_request("POST", "/orders", token, payload)

    if response and response.status_code == 201:
        order = response.json()
        log_success(f"Order created: {order.get('order_number')} (ID: {order.get('id')})")
        return order
    else:
        log_error(f"Create order failed: {response.status_code if response else 'No response'}")
        return None


def test_list_orders(token):
    """Test listing orders"""
    log_info("Testing list orders...")
    response = make_request("GET", "/orders", token)

    if response and response.status_code == 200:
        orders = response.json()
        log_success(f"Listed {len(orders)} order(s)")
        return orders
    else:
        log_error(f"List orders failed: {response.status_code if response else 'No response'}")
        return None


def main():
    print("\n" + "=" * 60)
    print("INVENTORY MANAGEMENT SYSTEM - END-TO-END TEST")
    print("=" * 60 + "\n")

    # Step 1: Health check
    if not test_health_check():
        print("\n" + RED + "Backend is not running. Please start it first." + RESET)
        return False

    # Step 2: Register user
    email, password = test_register()
    if not email:
        return False

    # Step 3: Login
    token = test_login(email, password)
    if not token:
        return False

    # Step 4: Get profile
    user = test_get_profile(token)
    if not user:
        return False

    # Step 5: Create product
    product = test_create_product(token)
    if not product:
        return False

    # Step 6: List products
    products = test_list_products(token)
    if not products:
        return False

    # Step 7: Create warehouse
    warehouse = test_create_warehouse(token)
    if not warehouse:
        return False

    # Step 8: List warehouses
    warehouses = test_list_warehouses(token)
    if not warehouses:
        return False

    # Step 9: Create order
    order = test_create_order(token, warehouse["id"], product["id"])
    if not order:
        return False

    # Step 10: List orders
    orders = test_list_orders(token)
    if not orders:
        return False

    print("\n" + "=" * 60)
    print(GREEN + "ALL TESTS PASSED! ✓" + RESET)
    print("=" * 60 + "\n")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
