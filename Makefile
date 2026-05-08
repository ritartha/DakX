# ── DakX Development Commands ──
# All commands assume you have activated your Python virtual environment.

# Backend
install:
	pip install -r backend/requirements.txt

migrate:
	cd backend && python manage.py migrate

makemigrations:
	cd backend && python manage.py makemigrations

createsuperuser:
	cd backend && python manage.py createsuperuser

runserver:
	cd backend && python manage.py runserver 8000

daphne:
	cd backend && daphne -b 0.0.0.0 -p 8000 config.asgi:application

shell:
	cd backend && python manage.py shell_plus

collectstatic:
	cd backend && python manage.py collectstatic --noinput

test:
	cd backend && python manage.py test

# Frontend
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

# Full setup
setup: install migrate frontend-install
	@echo "Setup complete! Run 'make runserver' and 'make frontend-dev' in separate terminals."
