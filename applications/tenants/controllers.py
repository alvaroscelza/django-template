from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from applications.tenants.services.google_auth_service import GoogleAuth


class GoogleAuthController(ViewSet):
    authentication_classes = []
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.google_auth = GoogleAuth()
    
    @action(detail=False, methods=['get'], url_path='login')
    def login(self, _):
        """Generate Google OAuth authorization URL"""
        redirect_uri = settings.OAUTH_REDIRECT_URL
        auth_url = self.google_auth.get_authorization_url(redirect_uri)
        return Response({"auth_url": auth_url})

    @action(detail=False, methods=['get'], url_path='callback')
    def callback(self, request):
        code = request.GET.get('code')
        if not code:
            # Check if this is an API request (has Accept: application/json header)
            if request.headers.get('Accept') == 'application/json':
                return Response({'error': 'Authorization code not provided'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Redirect to frontend with error (for browser OAuth flow)
                error_params = urlencode({'error': 'Authorization code not provided'})
                return redirect(f'/?{error_params}')
        
        redirect_uri = settings.OAUTH_REDIRECT_URL
        
        try:
            user_info = self.google_auth.get_user_info(code, redirect_uri)
            email = user_info['email']
            
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                error_message = f"User with email {email} is not authorized. Please contact your administrator."
                if request.headers.get('Accept') == 'application/json':
                    return Response({'error': error_message}, status=status.HTTP_403_FORBIDDEN)
                else:
                    error_params = urlencode({'error': error_message})
                    return redirect(f'/?{error_params}')
            
            # Create Simple JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            # Redirect to frontend with success data (for browser OAuth flow)
            success_params = urlencode({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'bearer',
                'user_id': user.pk,
                'email': email,
                'username': user.username
            })
            return redirect(f'/?{success_params}')
            
        except Exception as e:
            # Check if this is an API request
            if request.headers.get('Accept') == 'application/json':
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Redirect to frontend with error (for browser OAuth flow)
                error_params = urlencode({'error': str(e)})
                return redirect(f'/?{error_params}')
    
    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh_token(self, request):
        """Refresh JWT access token using refresh token"""
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
            
            refresh = RefreshToken(refresh_token)
            
            # Verify that the user still exists in the database
            user_id = refresh.payload.get('user_id')
            if not user_id:
                return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User no longer exists'}, status=status.HTTP_401_UNAUTHORIZED)
            
            access_token = str(refresh.access_token)
            
            return Response({
                'access_token': access_token,
                'token_type': 'bearer'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
