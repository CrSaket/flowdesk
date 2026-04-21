#!/bin/bash
set -e
cd "$(dirname "$0")"

VENV_DIR="../.venv"
PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

if ! "$PYTHON" -c "import fastapi" 2>/dev/null; then
  echo "Installing Python dependencies..."
  "$PIP" install -r requirements.txt --quiet
fi

# Kill anything already on port 8000
lsof -ti :8000 | xargs kill -9 2>/dev/null || true

echo "Starting ClearAI backend on http://localhost:8000"
"$PYTHON" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
