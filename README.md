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
+--------------+   HTTP/WS  +-------------------+   async jobs   +----------------+
|    Nginx     +----------->+ Django + DRF API  +--------------->+ Celery Worker  |
| reverse proxy|            | Channels / ASGI   |                | Celery Beat    |
+------+-------+            +----+---------+----+                +--------+-------+
       |                         |         |                              |
       |                         |         +------------------------------+
       |                         |                     Redis              
       |                         v                                           
       |                  +--------------+            +----------------+
       +----------------->+ PostgreSQL   |            | MinIO / S3     |
                          | mail store   |            | attachments    |
                          +--------------+            +----------------+
```

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

## Quick Start

1. Clone the repository.
2. `cp .env.example .env`
3. `make build`
4. `make up`
5. `make migrate`

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

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Enable debug features |
| `ALLOWED_HOSTS` | Allowed Django hosts |
| `DOMAIN` | Public domain used in links and Message-ID generation |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL for cache, channels, and Celery |
| `AWS_ACCESS_KEY_ID` | MinIO / S3 access key |
| `AWS_SECRET_ACCESS_KEY` | MinIO / S3 secret key |
| `AWS_STORAGE_BUCKET_NAME` | Media bucket name |
| `AWS_S3_ENDPOINT_URL` | S3-compatible endpoint |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_HOST_USER` | SMTP username |
| `EMAIL_HOST_PASSWORD` | SMTP password |
| `EMAIL_USE_TLS` | Enable TLS for SMTP |
| `CELERY_BROKER_URL` | Redis broker URL |
| `CELERY_RESULT_BACKEND` | Redis result backend |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token TTL |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token TTL |
| `CORS_ALLOWED_ORIGINS` | Trusted frontend origins |

## Development Workflow

- Use the service layer for mail and user business logic.
- Keep views thin and repository access inside `repositories.py`.
- Run `make makemigrations && make migrate` when models change.
- Use `make test` for Django tests and `npm run build` for frontend smoke validation.

## Production Deployment Notes

- Terminate TLS at Nginx or a cloud load balancer.
- Run Daphne behind Nginx for HTTP + WebSocket upgrade support.
- Use managed PostgreSQL, Redis, and object storage in production.
- Configure Celery worker autoscaling separately from web nodes.
- Store secrets in a managed secret store instead of `.env` files.

## Architecture Decisions

- **MailboxEntry pattern:** message content stays immutable on `Message`, while per-user state such as folder, read status, starred flag, and labels stays on `MailboxEntry`.
- **Service layer:** all business logic sits in services to keep APIs thin and testable.
- **Repository layer:** query shaping uses `select_related` and `prefetch_related` to avoid N+1 lookups.
- **Async delivery:** SMTP delivery, incoming message processing, notification fan-out, and trash cleanup run through Celery.
- **Realtime scope:** WebSockets only push lightweight unread-count / new-mail notifications; clients fetch message bodies through REST.
