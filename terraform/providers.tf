# terraform/providers.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.95.0" # Use a recent version
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
  # Credentials loaded automatically from ~/.aws/credentials or environment variables
}