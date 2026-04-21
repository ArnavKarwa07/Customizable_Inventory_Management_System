def _admin_headers(client):
    login = client.post(
        "/api/v1/auth/login",
        json={"org_slug": "default", "email": "admin@example.com", "password": "Admin@123456"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_product_inventory_and_order_flow(client):
    headers = _admin_headers(client)

    warehouse_1 = client.post(
        "/api/v1/warehouses",
        headers=headers,
        json={"name": "Main", "code": "MAIN", "address": "A"},
    )
    assert warehouse_1.status_code == 201
    main_wh_id = warehouse_1.json()["id"]

    warehouse_2 = client.post(
        "/api/v1/warehouses",
        headers=headers,
        json={"name": "Backup", "code": "BKP", "address": "B"},
    )
    assert warehouse_2.status_code == 201
    backup_wh_id = warehouse_2.json()["id"]

    product_response = client.post(
        "/api/v1/products",
        headers=headers,
        json={
            "sku": "SKU-100",
            "name": "Widget",
            "description": "Core item",
            "unit_price": 12.5,
            "low_stock_threshold": 3,
        },
    )
    assert product_response.status_code == 201
    product_id = product_response.json()["id"]

    adjust_response = client.post(
        "/api/v1/inventory/adjust",
        headers=headers,
        json={
            "product_id": product_id,
            "warehouse_id": main_wh_id,
            "change": 15,
            "reason": "Initial stock",
        },
    )
    assert adjust_response.status_code == 200
    assert adjust_response.json()["quantity"] == 15

    transfer_response = client.post(
        "/api/v1/inventory/transfer",
        headers=headers,
        json={
            "product_id": product_id,
            "from_warehouse_id": main_wh_id,
            "to_warehouse_id": backup_wh_id,
            "quantity": 4,
        },
    )
    assert transfer_response.status_code == 200

    order_response = client.post(
        "/api/v1/orders",
        headers=headers,
        json={
            "warehouse_id": backup_wh_id,
            "items": [{"product_id": product_id, "quantity": 2}],
        },
    )
    assert order_response.status_code == 201
    order_id = order_response.json()["id"]

    status_update = client.patch(
        f"/api/v1/orders/{order_id}/status",
        headers=headers,
        json={"status": "confirmed"},
    )
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "confirmed"

    low_stock_response = client.get("/api/v1/inventory/low-stock", headers=headers)
    assert low_stock_response.status_code == 200
