# terraform/variables.tf
variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "eu-north-1" # Or your preferred region
}

variable "project_name" {
    description = "Base name for resources."
    type        = string
    default     = "aether"
}

variable "vpc_id" {
    description = "ID of the VPC to deploy into (using default for now)."
    type        = string
    # You would typically look this up or create it
    # For now, manually find your Default VPC ID in the AWS Console
    default     = "vpc-xxxxxxxxxxxxxxxxx" # <-- REPLACE with your Default VPC ID
}

# Add more variables for instance types, CIDR blocks, etc. later