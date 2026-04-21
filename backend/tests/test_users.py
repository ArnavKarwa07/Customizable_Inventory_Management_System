def _login(client, email: str, password: str) -> str:
    response = client.post("/api/v1/auth/login", json={"org_slug": "default", "email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_users_me_requires_auth(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_admin_can_list_users(client):
    token = _login(client, "admin@example.com", "Admin@123456")

    response = client.get("/api/v1/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_staff_cannot_list_users(client):
    register = client.post(
        "/api/v1/auth/register",
        json={
            "org_slug": "default",
            "email": "staff2@example.com",
            "full_name": "Staff Two",
            "password": "Secret123!",
        },
    )
    assert register.status_code == 201

    token = _login(client, "staff2@example.com", "Secret123!")
    response = client.get("/api/v1/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
