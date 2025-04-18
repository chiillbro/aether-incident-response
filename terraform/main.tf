# terraform/main.tf

# Example: ECR Repositories
resource "aws_ecr_repository" "backend" {
  name = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE" # Or IMMUTABLE for stricter tagging

  tags = {
    Project = var.project_name
    Env     = "prod" # Example tag
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# Example: ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# --- Placeholder for other resources ---
# You would progressively add:
# - aws_security_group resources (ALB, ECS, RDS)
# - aws_db_instance (RDS) - managing secrets securely is key here (e.g., using aws_secretsmanager_secret)
# - aws_lb, aws_lb_target_group, aws_lb_listener, aws_lb_listener_rule (ALB)
# - aws_ecs_task_definition (Backend & Frontend) - referencing ECR repos, managing env vars/secrets
# - aws_ecs_service (Backend & Frontend) - linking task defs to cluster and ALB
# ---