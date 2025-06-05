import asyncio
import websockets
import json
import time

async def test_websocket():
    uri = "ws://localhost:8000/ws/auth/"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")
        
        timestamp = str(int(time.time()))
        email = f"testuser_{timestamp}@example.com"
        password = "Test123!@#"
        
        # Test signup
        signup_data = {
            "action": "signup",
            "email": email,
            "password": password,
            "username": f"testuser_{timestamp}",
            "first_name": "Test",
            "last_name": "User"
        }
        await websocket.send(json.dumps(signup_data))
        response = await websocket.recv()
        print(f"Signup Response: {response}")
        
        # Test signin with the same credentials
        signin_data = {
            "action": "signin",
            "email": email,
            "password": password
        }
        await websocket.send(json.dumps(signin_data))
        response = await websocket.recv()
        print(f"Signin Response: {response}")

try:
    asyncio.get_event_loop().run_until_complete(test_websocket())
except Exception as e:
    print(f"Error: {e}")
