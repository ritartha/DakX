import django_filters

from .models import MailboxEntry


class MailboxEntryFilter(django_filters.FilterSet):
    class Meta:
        model = MailboxEntry
        fields = {'folder': ['exact'], 'is_read': ['exact'], 'is_starred': ['exact']}
