import pytest
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token, decode_token, _encode_token

def test_password_hashing():
    password = "supersecretpassword"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_create_tokens_without_org():
    subject = "user123"
    
    # Access token
    access_token = create_access_token(subject)
    decoded_access = decode_token(access_token)
    assert decoded_access["sub"] == subject
    assert decoded_access["type"] == "access"
    assert "org_id" not in decoded_access
    
    # Refresh token
    refresh_token = create_refresh_token(subject)
    decoded_refresh = decode_token(refresh_token)
    assert decoded_refresh["sub"] == subject
    assert decoded_refresh["type"] == "refresh"
    assert "org_id" not in decoded_refresh

def test_create_tokens_with_org():
    subject = "user123"
    org_id = 42
    
    # Access token
    access_token = create_access_token(subject, org_id)
    decoded_access = decode_token(access_token)
    assert decoded_access["sub"] == subject
    assert decoded_access["org_id"] == org_id
    
    # Refresh token
    refresh_token = create_refresh_token(subject, org_id)
    decoded_refresh = decode_token(refresh_token)
    assert decoded_refresh["sub"] == subject
    assert decoded_refresh["org_id"] == org_id

def test_encode_token_bytes_or_str(monkeypatch):
    import jwt
    from app.core.config import settings
    # Branch 1: token is bytes (pyjwt 1.x or internal type mocking)
    def mock_encode_bytes(payload, key, algorithm):
        return b"mocked_bytes_token"
    
    monkeypatch.setattr(jwt, "encode", mock_encode_bytes)
    token = _encode_token({"test": "data"})
    assert isinstance(token, str)
    assert token == "mocked_bytes_token"

    # Branch 2: token is str (pyjwt 2.x+)
    def mock_encode_str(payload, key, algorithm):
        return "mocked_string_token"
    
    monkeypatch.setattr(jwt, "encode", mock_encode_str)
    token2 = _encode_token({"test": "data"})
    assert isinstance(token2, str)
    assert token2 == "mocked_string_token"
