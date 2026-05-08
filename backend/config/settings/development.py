from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ['*']

# ── Database: SQLite for local dev (no PostgreSQL needed) ──
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BACKEND_DIR / 'db.sqlite3',
    }
}

# ── Email: print to console ──
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ── Cache: in-memory ──
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'dakx-development',
    }
}

# ── Channels: in-memory (no Redis needed) ──
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}

# ── Storage: local filesystem ──
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    },
}

# ── Celery: eager mode (runs tasks synchronously, no broker needed) ──
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'

# ── CORS: allow Vite dev server ──
CORS_ALLOW_ALL_ORIGINS = True
