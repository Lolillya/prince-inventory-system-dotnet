#!/usr/bin/env bash
set -euo pipefail

# Path assumptions: working dir is /app/backend (set in Dockerfile)
cd /src || exit 1

# Function to try running migrations until success or timeout
MAX_RETRIES=30
SLEEP_SECONDS=5
count=0

echo "Waiting for database and applying EF migrations..."

# Ensure local dotnet tools (including dotnet-ef if configured) are restored so `dotnet ef` is available
echo "Restoring local dotnet tools (if any)..."
if dotnet tool restore; then
  echo "dotnet tools restored."
else
  echo "dotnet tool restore failed or no tools defined; 'dotnet ef' may still be available if installed globally." >&2
fi

while true; do
  if dotnet ef database update --project backend.csproj --startup-project backend.csproj; then
    echo "Migrations applied successfully."
    break
  else
    count=$((count+1))
    echo "Migration attempt $count failed. Sleeping ${SLEEP_SECONDS}s and retrying..."
    if [ "$count" -ge "$MAX_RETRIES" ]; then
      echo "Reached max retries ($MAX_RETRIES). Proceeding to start the app without applied migrations." >&2
      break
    fi
    sleep $SLEEP_SECONDS
  fi
done

# Start the application with hot-reload and listen on all interfaces
exec dotnet watch run --urls http://0.0.0.0:5055
