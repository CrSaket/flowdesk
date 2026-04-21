FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for XGBoost / pandas
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create a data directory for SQLite persistence
RUN mkdir -p /data
ENV DB_DIR=/data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
