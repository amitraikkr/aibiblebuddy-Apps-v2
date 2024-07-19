variable "aws_region" {
  description = "AWS Region to deploy"
  type = string
}

variable "user_pool_name" {
    description = "name of the cognito user pool"
    type = string
}

variable "user_pool_client_name" {
    description = "name of the cognito user client name"
    type = string
}

variable "identity_pool_name" {
    description = "name of the cognito identity pool name"
    type = string
}

variable "cognito_authenticated_role" {
    description = "cognito authenticated role name"
    type = string
}

