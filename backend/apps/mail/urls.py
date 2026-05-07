from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AttachmentUploadView,
    ComposeView,
    FolderViewSet,
    ForwardView,
    LabelViewSet,
    MailboxEntryViewSet,
    ReplyView,
    SearchView,
    ThreadViewSet,
    TrashRestoreView,
)

router = DefaultRouter()
router.register('entries', MailboxEntryViewSet, basename='mailbox-entry')
router.register('threads', ThreadViewSet, basename='thread')
router.register('labels', LabelViewSet, basename='label')
router.register('folders', FolderViewSet, basename='folder')

urlpatterns = router.urls + [
    path('compose/', ComposeView.as_view(), name='compose'),
    path('reply/', ReplyView.as_view(), name='reply'),
    path('forward/', ForwardView.as_view(), name='forward'),
    path('attachments/', AttachmentUploadView.as_view(), name='attachment-upload'),
    path('search/', SearchView.as_view(), name='mail-search'),
    path('trash/<uuid:pk>/restore/', TrashRestoreView.as_view(), name='trash-restore'),
]
