from __future__ import annotations

import pyotp
from django.contrib.auth import authenticate
from rest_framework import generics, permissions, response, status, views
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken

from .repositories import UserRepository
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    VerifyTwoFactorSerializer,
)
from .services import UserService


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.register(**serializer.validated_data)
        return response.Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, email=serializer.validated_data['email'], password=serializer.validated_data['password'])
        if not user:
            return response.Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return response.Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('refresh')
        if token:
            RefreshToken(token).blacklist()
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class EmailVerifyView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get('token', '')
        UserService.verify_email(token)
        return response.Response({'verified': True})


class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        UserService.send_password_reset(serializer.validated_data['email'])
        return response.Response({'sent': True})


class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        UserService.reset_password(serializer.validated_data['token'], serializer.validated_data['new_password'])
        return response.Response({'reset': True})


class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return response.Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileSerializer(instance=request.user.profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = UserRepository.update_profile(request.user, **serializer.validated_data)
        return response.Response(ProfileSerializer(profile).data)


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data['old_password']):
            return response.Response({'detail': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return response.Response({'changed': True})


class Enable2FAView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        provisioning_uri = UserService.enable_2fa(request.user)
        return response.Response({'provisioning_uri': provisioning_uri, 'secret': request.user.totp_secret})


class Verify2FAView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VerifyTwoFactorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        totp = pyotp.TOTP(request.user.totp_secret)
        if not request.user.totp_secret or not totp.verify(serializer.validated_data['code']):
            return response.Response({'detail': 'Invalid 2FA code.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.is_2fa_enabled = True
        request.user.save(update_fields=['is_2fa_enabled'])
        return response.Response({'verified': True})
