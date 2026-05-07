build:
docker-compose build

up:
docker-compose up -d

down:
docker-compose down

migrate:
docker-compose exec backend python manage.py migrate

makemigrations:
docker-compose exec backend python manage.py makemigrations

createsuperuser:
docker-compose exec backend python manage.py createsuperuser

test:
docker-compose exec backend python manage.py test

shell:
docker-compose exec backend python manage.py shell_plus

logs:
docker-compose logs -f

collectstatic:
docker-compose exec backend python manage.py collectstatic --noinput
