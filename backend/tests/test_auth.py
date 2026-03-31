def test_register_and_login_and_refresh(client):
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "staff1@example.com",
            "full_name": "Staff One",
            "password": "Secret123!",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "staff1@example.com", "password": "Secret123!"},
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_response.status_code == 200
    refreshed_tokens = refresh_response.json()
    assert refreshed_tokens["refresh_token"] != tokens["refresh_token"]


def test_login_fails_with_wrong_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401
