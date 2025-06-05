import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/auth/"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")
        
        # Test signup
        signup_data = {
            "action": "signup",
            "email": "test@example.com",
            "password": "Test123!"
        }
        await websocket.send(json.dumps(signup_data))
        response = await websocket.recv()
        print(f"Response: {response}")

try:
    asyncio.get_event_loop().run_until_complete(test_websocket())
except Exception as e:
    print(f"Error: {e}")
