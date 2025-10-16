import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlencode

import requests
from django.conf import settings
from jwt import encode, decode
from jwt.exceptions import InvalidTokenError

# Configuration
SECRET_KEY = getattr(settings, 'SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth configuration
GOOGLE_CLIENT_ID = getattr(settings, 'GOOGLE_CLIENT_ID', 'demo_client_id')
GOOGLE_CLIENT_SECRET = getattr(settings, 'GOOGLE_CLIENT_SECRET', 'demo_client_secret')


class GoogleAuthException(Exception):
    """Custom exception for Google Auth errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class GoogleAuth:
    def __init__(self):
        self.client_id = GOOGLE_CLIENT_ID
        self.client_secret = GOOGLE_CLIENT_SECRET
        self.authorization_endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_endpoint = "https://oauth2.googleapis.com/token"
        self.userinfo_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"

    def get_authorization_url(self, redirect_uri: str) -> str:
        """Get Google OAuth authorization URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': 'openid email profile',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        return f"{self.authorization_endpoint}?{urlencode(params)}"

    def get_user_info(self, authorization_code: str, redirect_uri: str) -> dict:
        """Exchange authorization code for user info"""
        # Exchange code for token
        token_data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': authorization_code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }

        token_response = requests.post(self.token_endpoint, data=token_data)
        if token_response.status_code != 200:
            raise GoogleAuthException(
                "Failed to exchange authorization code for token",
                status_code=400
            )

        token_json = token_response.json()
        access_token = token_json.get('access_token')

        if not access_token:
            raise GoogleAuthException(
                "No access token received from Google",
                status_code=400
            )

        # Get user info
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(self.userinfo_endpoint, headers=headers)

        if user_response.status_code != 200:
            raise GoogleAuthException(
                "Failed to get user info from Google",
                status_code=400
            )

        user_info = user_response.json()

        return {
            'email': user_info['email'],
            'name': user_info.get('name', ''),
            'picture': user_info.get('picture', '')
        }

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> dict:
        try:
            payload = decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email is None:
                raise GoogleAuthException(
                    "Could not validate credentials",
                    status_code=401
                )
            return payload
        except InvalidTokenError:
            raise GoogleAuthException(
                "Could not validate credentials",
                status_code=401
            )
