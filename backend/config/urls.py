from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/mail/', include('apps.mail.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/spam/', include('apps.spam.urls')),
]
