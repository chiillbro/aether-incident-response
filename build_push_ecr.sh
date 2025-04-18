# export AWS_REGION=us-east-1
# export AWS_PROFILE=aether
# export AWS_ACCOUNT_ID=$(
#   aws sts get-caller-identity \
#     --query Account --output text
# )
# export BACKEND_ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/aether-backend"
# export FRONTEND_ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/aether-frontend"

# # Confirm it:
# echo $BACKEND_ECR_URI
# # ➜ 123456789012.dkr.ecr.us-east-1.amazonaws.com/aether-backend

# # Now login works:
# aws ecr get-login-password \
#   --region $AWS_REGION \
#   | docker login \
#       --username AWS \
#       --password-stdin \
#       $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# # And your tags will be valid:
# docker build -t $BACKEND_ECR_URI:latest \
#              -f backend/Dockerfile ./backend
# docker push $BACKEND_ECR_URI:latest

# docker build -t $FRONTEND_ECR_URI:latest \
#              -f frontend/Dockerfile ./frontend
# docker push $FRONTEND_ECR_URI:latest





#!/bin/bash

# Set AWS Region and Profile consistently
export AWS_REGION="eu-north-1"
export AWS_PROFILE="aether"

# Get Account ID using the specified profile
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text)

# Check if Account ID was retrieved
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Error: Failed to retrieve AWS Account ID. Check AWS credentials and profile '$AWS_PROFILE'."
  exit 1
fi

# Construct ECR URIs (Ensure these match your actual ECR repo names EXACTLY)
# ECR supports namespaces like 'aether/'
export BACKEND_ECR_REPOSITORY="aether/aether-backend"
export FRONTEND_ECR_REPOSITORY="aether/aether-frontend"
export BACKEND_ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_ECR_REPOSITORY"
export FRONTEND_ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$FRONTEND_ECR_REPOSITORY"

# Confirm variables
echo "Using Profile: $AWS_PROFILE"
echo "Using Region:  $AWS_REGION"
echo "Account ID:    $AWS_ACCOUNT_ID"
echo "Backend URI:   $BACKEND_ECR_URI"
echo "Frontend URI:  $FRONTEND_ECR_URI"

# Login to ECR using the specified profile
echo "Attempting ECR login..."
aws ecr get-login-password --profile $AWS_PROFILE --region $AWS_REGION | docker login \
    --username AWS \
    --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Check login status (docker login doesn't have a great check, but AWS CLI returns non-zero on fail)
if [ $? -ne 0 ]; then
    echo "Error: ECR login failed."
    exit 1
fi
echo "ECR Login Succeeded."

ALB_DNS_NAME="aether-alb-1938841100.eu-north-1.elb.amazonaws.com"
echo "Using ALB DNS: $ALB_DNS_NAME"

# --- Specify Target Platform ---
TARGET_PLATFORM="linux/amd64"
echo "Targeting platform: $TARGET_PLATFORM"

# Build and Push Backend
echo "Building backend image... for $TARGET_PLATFORM..."
docker build --platform $TARGET_PLATFORM -t $BACKEND_ECR_URI:latest -f backend/Dockerfile ./backend # Add --no-cache here if suspecting cache issues
if [ $? -ne 0 ]; then echo "Error: Backend Docker build failed."; exit 1; fi

echo "Pushing backend image..."
docker push $BACKEND_ECR_URI:latest
if [ $? -ne 0 ]; then echo "Error: Backend Docker push failed."; exit 1; fi
echo "Backend image pushed successfully."

# Build and Push Frontend
echo "Building frontend image... for $TARGET_PLATFORM..."
docker build \
  --platform $TARGET_PLATFORM \
  --build-arg NEXT_PUBLIC_API_BASE_URL="http://${ALB_DNS_NAME}/server-api" \
  -t $FRONTEND_ECR_URI:latest \
  -f frontend/Dockerfile ./frontend
if [ $? -ne 0 ]; then echo "Error: Frontend Docker build failed."; exit 1; fi

echo "Pushing frontend image..."
docker push $FRONTEND_ECR_URI:latest
if [ $? -ne 0 ]; then echo "Error: Frontend Docker push failed."; exit 1; fi
echo "Frontend image pushed successfully."

echo "Script finished."