import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # Register
    reg_res = await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@wenai.com",
        "password": "strongpassword123"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "user" in data
    assert data["user"]["email"] == "test@wenai.com"
    assert "tokens" in data
    assert "access_token" in data["tokens"]

    # Login
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "test@wenai.com",
        "password": "strongpassword123"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data["tokens"]

@pytest.mark.asyncio
async def test_models_list(client: AsyncClient):
    response = await client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) > 0
