#!/bin/sh
# backend/entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run database migrations
echo "Entrypoint: Running prisma migrate deploy..."
npx prisma migrate deploy

# Run database seed (Optional: Add this if you have a seed script)
# echo "Entrypoint: Running prisma db seed..."
# npx prisma db seed

echo "Entrypoint: Migrations complete. Starting application..."

# Execute the command passed as arguments to this script (which will be the CMD from the Dockerfile)
exec "$@"