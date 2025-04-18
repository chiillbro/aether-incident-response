# terraform/outputs.tf

output "backend_ecr_repository_url" {
  description = "The URL of the backend ECR repository."
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repository_url" {
  description = "The URL of the frontend ECR repository."
  value       = aws_ecr_repository.frontend.repository_url
}

# Add outputs for ALB DNS, RDS endpoint etc. as you define those resources
# output "alb_dns_name" {
#   description = "DNS name of the Application Load Balancer."
#   value       = aws_lb.main.dns_name # Assuming aws_lb resource is named 'main'
# }