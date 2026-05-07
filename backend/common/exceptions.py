from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class DakXBaseException(Exception):
    default_detail = 'An application error occurred.'
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.default_detail
        super().__init__(self.detail)


class UserAlreadyExistsError(DakXBaseException):
    default_detail = 'A user with this email already exists.'
    status_code = status.HTTP_409_CONFLICT


class InvalidTokenError(DakXBaseException):
    default_detail = 'The supplied token is invalid or has expired.'
    status_code = status.HTTP_400_BAD_REQUEST


class MailNotFoundError(DakXBaseException):
    default_detail = 'The requested mail item could not be found.'
    status_code = status.HTTP_404_NOT_FOUND


class UnauthorizedAccessError(DakXBaseException):
    default_detail = 'You do not have permission to access this resource.'
    status_code = status.HTTP_403_FORBIDDEN


class AttachmentTooLargeError(DakXBaseException):
    default_detail = 'The supplied attachment exceeds the maximum allowed size.'
    status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE


def custom_exception_handler(exc, context):
    if isinstance(exc, DakXBaseException):
        return Response({'detail': exc.detail}, status=exc.status_code)
    response = drf_exception_handler(exc, context)
    if response is not None:
        response.data = {'detail': response.data}
    return response
