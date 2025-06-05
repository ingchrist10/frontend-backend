from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomUserSerializer
from django.core.exceptions import ValidationError
import asyncio

User = get_user_model()

class AuthConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'signup':
            response = await self.handle_signup(data)
        elif action == 'signin':
            response = await self.handle_signin(data)
        else:
            response = {'status': 'error', 'message': 'Invalid action'}
            
        await self.send(text_data=json.dumps(response))

    async def handle_signup(self, data):
        try:
            # Run user creation in a thread to not block the event loop
            loop = asyncio.get_event_loop()
            user = await loop.run_in_executor(None, self._create_user, data)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return {
                'status': 'success',
                'message': 'User created successfully',
                'data': {
                    'user': CustomUserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            }
        except ValidationError as e:
            return {'status': 'error', 'message': str(e)}
        except Exception as e:
            return {'status': 'error', 'message': 'An error occurred during signup'}

    async def handle_signin(self, data):
        try:
            email = data.get('email')
            password = data.get('password')
            
            # Run authentication in a thread
            loop = asyncio.get_event_loop()
            user = await loop.run_in_executor(None, self._authenticate_user, email, password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                return {
                    'status': 'success',
                    'message': 'Login successful',
                    'data': {
                        'user': CustomUserSerializer(user).data,
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    }
                }
            else:
                return {'status': 'error', 'message': 'Invalid credentials'}
        except Exception as e:
            return {'status': 'error', 'message': 'An error occurred during signin'}

    def _create_user(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            raise ValidationError('Email and password are required')
            
        if User.objects.filter(email=email).exists():
            raise ValidationError('Email already exists')
            
        user = User.objects.create_user(email=email, password=password)
        return user

    def _authenticate_user(self, email, password):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            pass
        return None
