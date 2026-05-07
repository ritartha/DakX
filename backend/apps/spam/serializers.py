from rest_framework import serializers

from .models import SpamReport


class SpamReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpamReport
        fields = ('id', 'reporter', 'message', 'reason', 'created_at', 'is_reviewed', 'reviewed_by', 'reviewed_at')
        read_only_fields = ('id', 'reporter', 'created_at', 'is_reviewed', 'reviewed_by', 'reviewed_at')
