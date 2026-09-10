FROM python:3.12-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy requirements & install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code & pre-built assets
COPY . .

# Expose port
EXPOSE 8000

ENV ENVIRONMENT=production
ENV HOST=0.0.0.0
ENV PORT=8000

CMD ["python", "run.py"]
