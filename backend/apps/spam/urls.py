from django.urls import path

from .views import SpamReportListView, SpamReportView

urlpatterns = [
    path('reports/', SpamReportView.as_view(), name='spam-report'),
    path('reports/all/', SpamReportListView.as_view(), name='spam-report-list'),
]
