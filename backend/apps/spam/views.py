from rest_framework import generics, permissions

from common.permissions import IsAdminOrReadOnly

from apps.mail.models import Message

from .models import SpamReport
from .serializers import SpamReportSerializer
from .services import SpamService


class SpamReportView(generics.CreateAPIView):
    serializer_class = SpamReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        message = Message.objects.get(id=self.request.data.get('message'))
        serializer.instance = SpamService.report(self.request.user, message, serializer.validated_data['reason'])


class SpamReportListView(generics.ListAPIView):
    serializer_class = SpamReportSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = SpamReport.objects.select_related('reporter', 'reviewed_by', 'message')
