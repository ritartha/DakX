# DakX

Production-grade Gmail/Yahoo-like mail platform foundation.

## Architecture

```text
                +-----------------------+
                |       React SPA       |
                |  Inbox / Compose UI   |
                +-----------+-----------+
                            |
                            v
                   HTTP/WS  +-------------------+
                  --------->+ Django + DRF API  |
                            | Channels / ASGI   |
                            +----+---------+----+
                                 |         |
                                 v         v
                          +-----------+  +-----------+
                          | SQLite    |  | Local FS  |
                          | (dev)     |  | media     |
                          +-----------+  +-----------+
```

> **Note:** For production, replace SQLite with PostgreSQL, add Redis for Celery/Channels, and use S3-compatible storage for attachments.

## ER Diagram

```text
User (1) ---- (1) Profile
User (1) ---- (*) Thread participants
User (1) ---- (*) Label
User (1) ---- (*) Folder
User (1) ---- (*) MailboxEntry (*) ---- (1) Message (*) ---- (1) Thread
Message (1) ---- (*) Attachment
User (1) ---- (*) Notification (*) ---- (0..1) Message
User (1) ---- (*) SpamReport (*) ---- (1) Message
User (1) ---- (*) SpamReport reviewed_by
MailboxEntry (*) ---- (*) Label
MailboxEntry (*) ---- (0..1) Folder
```

## Quick Start (Local Development)

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **npm**

### 1. Clone & set up environment

```bash
git clone <repo-url>
cd DakX

# Create Python virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies

```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if you need to change any defaults
```

### 4. Set up database

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
cd ..
```

### 5. Run the application

Open **two terminals** (both with venv activated):

```bash
# Terminal 1 — Backend (port 8000)
cd backend
python manage.py runserver 8000

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Visit **http://localhost:3000** in your browser.

## API Endpoints

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/users/register/` | Register a new account | No |
| POST | `/api/users/login/` | Obtain JWT access + refresh tokens | No |
| POST | `/api/users/logout/` | Blacklist refresh token | Yes |
| POST | `/api/users/token/refresh/` | Refresh access token | No |
| GET | `/api/users/verify-email/?token=` | Verify email token | No |
| POST | `/api/users/password-reset/` | Send reset link | No |
| POST | `/api/users/password-reset/confirm/` | Reset password with token | No |
| GET/PATCH | `/api/users/profile/` | View or update profile | Yes |
| POST | `/api/users/change-password/` | Rotate password | Yes |
| POST | `/api/users/2fa/enable/` | Generate TOTP secret | Yes |
| POST | `/api/users/2fa/verify/` | Verify TOTP code | Yes |
| GET | `/api/mail/entries/?folder=INBOX` | List mailbox entries by folder | Yes |
| GET | `/api/mail/entries/{id}/` | Retrieve mailbox entry | Yes |
| PATCH | `/api/mail/entries/{id}/` | Mark read/starred | Yes |
| DELETE | `/api/mail/entries/{id}/` | Move to trash | Yes |
| GET | `/api/mail/threads/` | List threads | Yes |
| GET | `/api/mail/threads/{id}/` | Retrieve thread details | Yes |
| POST | `/api/mail/compose/` | Compose or save draft | Yes |
| POST | `/api/mail/reply/` | Reply / reply-all | Yes |
| POST | `/api/mail/forward/` | Forward message | Yes |
| GET/POST | `/api/mail/labels/` | Manage labels | Yes |
| GET/POST | `/api/mail/folders/` | Manage folders | Yes |
| POST | `/api/mail/attachments/` | Upload attachment | Yes |
| GET | `/api/mail/search/?q=` | Search mailbox | Yes |
| POST | `/api/mail/trash/{id}/restore/` | Restore trashed mail | Yes |
| GET | `/api/notifications/` | List notifications | Yes |
| POST | `/api/notifications/{id}/mark_read/` | Mark notification read | Yes |
| POST | `/api/spam/reports/` | Report spam | Yes |
| GET | `/api/spam/reports/all/` | Review all spam reports | Admin |

## Environment Variables

| Variable | Purpose | Required for Dev? |
| --- | --- | --- |
| `SECRET_KEY` | Django secret key | Yes (set any value) |
| `DEBUG` | Enable debug features | Yes |
| `DJANGO_SETTINGS_MODULE` | Settings module path | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No (SQLite default) |
| `REDIS_URL` | Redis URL for cache, channels, Celery | No (in-memory default) |
| `EMAIL_HOST` | SMTP host | No (console default) |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token TTL | No |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token TTL | No |
| `CORS_ALLOWED_ORIGINS` | Trusted frontend origins | No |

## Development Workflow

- Use the service layer for mail and user business logic.
- Keep views thin and repository access inside `repositories.py`.
- Run `cd backend && python manage.py makemigrations && python manage.py migrate` when models change.
- Run `cd backend && python manage.py test` for Django tests.
- Run `cd frontend && npm run build` for frontend smoke validation.

## Production Deployment Notes

- Use PostgreSQL, Redis, and S3-compatible storage in production.
- Run Daphne behind Nginx for HTTP + WebSocket upgrade support.
- Configure Celery worker autoscaling separately from web nodes.
- Store secrets in a managed secret store instead of `.env` files.
- Terminate TLS at Nginx or a cloud load balancer.

## Architecture Decisions

- **MailboxEntry pattern:** message content stays immutable on `Message`, while per-user state such as folder, read status, starred flag, and labels stays on `MailboxEntry`.
- **Service layer:** all business logic sits in services to keep APIs thin and testable.
- **Repository layer:** query shaping uses `select_related` and `prefetch_related` to avoid N+1 lookups.
- **Async delivery:** SMTP delivery, incoming message processing, notification fan-out, and trash cleanup run through Celery.
- **Realtime scope:** WebSockets only push lightweight unread-count / new-mail notifications; clients fetch message bodies through REST.
