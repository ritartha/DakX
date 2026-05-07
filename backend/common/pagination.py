from rest_framework.pagination import CursorPagination


class MailCursorPagination(CursorPagination):
    page_size = 50
    ordering = '-created_at'
    cursor_query_param = 'cursor'
