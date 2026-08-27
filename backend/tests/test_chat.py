import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_conversation_and_messages_lifecycle(client: AsyncClient):
    # 1. Register & Login user
    reg_res = await client.post("/api/v1/auth/register", json={
        "name": "Chat User",
        "email": "chatuser@wenai.com",
        "password": "strongpassword123"
    })
    token = reg_res.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create conversation
    conv_res = await client.post("/api/v1/conversations", json={
        "title": "FastAPI Architecture Discussion",
        "model": "wen-core-default",
        "system_prompt": "Always answer concisely in Uzbek."
    }, headers=headers)
    assert conv_res.status_code == 201
    conv_data = conv_res.json()
    conv_id = conv_data["id"]
    assert conv_data["title"] == "FastAPI Architecture Discussion"

    # 3. Post a message
    msg_res = await client.post(f"/api/v1/conversations/{conv_id}/messages", json={
        "conversation_id": conv_id,
        "role": "user",
        "content": "FastAPI da clean architecture qanday quriladi?"
    }, headers=headers)
    assert msg_res.status_code == 201
    msg_data = msg_res.json()
    assert msg_data["content"] == "FastAPI da clean architecture qanday quriladi?"

    # 4. List messages
    list_msgs = await client.get(f"/api/v1/conversations/{conv_id}/messages", headers=headers)
    assert list_msgs.status_code == 200
    assert len(list_msgs.json()) == 1

    # 5. Clear messages
    clear_res = await client.post(f"/api/v1/conversations/{conv_id}/clear", headers=headers)
    assert clear_res.status_code == 200

    # Verify cleared
    list_after = await client.get(f"/api/v1/conversations/{conv_id}/messages", headers=headers)
    assert len(list_after.json()) == 0
