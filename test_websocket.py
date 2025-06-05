import asyncio
import websockets
import json

async def test_signup():
    uri = "ws://localhost:8000/ws/auth/"
    async with websockets.connect(uri) as websocket:
        # Test signup
        signup_data = {
            "action": "signup",
            "email": "test@example.com",
            "password": "Test123!@#"
        }
        await websocket.send(json.dumps(signup_data))
        response = await websocket.recv()
        print("Signup Response:", json.loads(response))

async def test_signin():
    uri = "ws://localhost:8000/ws/auth/"
    async with websockets.connect(uri) as websocket:
        # Test signin
        signin_data = {
            "action": "signin",
            "email": "test@example.com",
            "password": "Test123!@#"
        }
        await websocket.send(json.dumps(signin_data))
        response = await websocket.recv()
        print("Signin Response:", json.loads(response))

async def main():
    print("Testing Signup...")
    await test_signup()
    print("\nTesting Signin...")
    await test_signin()

if __name__ == "__main__":
    asyncio.run(main())
