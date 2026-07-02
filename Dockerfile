FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=python/app.py

# Run the app
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--chdir", "python", "app:app"]