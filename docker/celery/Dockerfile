FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/development.txt
COPY . .
