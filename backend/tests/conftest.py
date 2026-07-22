import pytest
from fastapi.testclient import TestClient

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    email = "pytest_user@archpilot.dev"
    password = "TestPass123"

    client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": password,
        "full_name": "Pytest User",
        "company_name": None,
    })

    res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}