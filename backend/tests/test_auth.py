def test_signup_creates_user(client):
    res = client.post("/api/v1/auth/signup", json={
        "email": "newuser_test@archpilot.dev",
        "password": "SecurePass123",
        "full_name": "New User",
        "company_name": None,
    })
    assert res.status_code == 201
    assert res.json()["email"] == "newuser_test@archpilot.dev"
    assert "password" not in res.json()


def test_signup_duplicate_email_fails(client):
    payload = {
        "email": "dup_test@archpilot.dev",
        "password": "SecurePass123",
        "full_name": "Dup User",
        "company_name": None,
    }
    client.post("/api/v1/auth/signup", json=payload)
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 400


def test_login_wrong_password_fails(client):
    client.post("/api/v1/auth/signup", json={
        "email": "login_test@archpilot.dev",
        "password": "CorrectPass123",
        "full_name": "Login User",
        "company_name": None,
    })
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "login_test@archpilot.dev", "password": "WrongPass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_me_returns_current_user(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "pytest_user@archpilot.dev"