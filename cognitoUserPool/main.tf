provider "aws" {
    profile = "default"  
}

resource "aws_cognito_user_pool" "bible_app_user_pool" {
    name = var.user_pool_name

    schema {
      name = "email"
      attribute_data_type = "String"
      required = true
      mutable = true

    }

    auto_verified_attributes = ["email"]

    password_policy {
      minimum_length = 8
      require_lowercase = true
      require_numbers = true
      require_symbols = true
      require_uppercase = true
    }
}

resource "aws_cognito_user_pool_client" "bible_app_user_pool_client" {
    user_pool_id = aws_cognito_user_pool.bible_app_user_pool.id
    name = var.user_pool_client_name

    explicit_auth_flows = [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_ADMIN_USER_PASSWORD_AUTH"
    ]
    generate_secret = false  
}

resource "aws_cognito_identity_pool" "bible_app_identity_pool" {
    identity_pool_name = var.identity_pool_name
    allow_unauthenticated_identities = false

    cognito_identity_providers {
      client_id = aws_cognito_user_pool_client.bible_app_user_pool_client.id
      provider_name = aws_cognito_user_pool.bible_app_user_pool.endpoint
      server_side_token_check = true
    }
}

resource "aws_iam_role" "authenticated_role" {
    name = var.cognito_authenticated_role

    assume_role_policy = jsonencode({
        Version = "2012-10-17",
        Statement = [ 
            {
                Effect = "Allow",
                Principal = {
                    Federated = "cognito-identity.amazonaws.com"
                },
                Action = "sts:AssumeRoleWithWebIdentity",
                Condition = {
                    "StringEquals" = {
                        "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.bible_app_identity_pool.id
                    },
                    "ForAnyValue:StringLike" = {
                        "cognito-identity.amazonaws.com:amr" = "authenticated"
                    }
                }
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "authenticated_policy" {
  role = aws_iam_role.authenticated_role.name
  policy_arn =   "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
  
}

resource "aws_cognito_identity_pool_roles_attachment" "identity_pool_roles" {
    identity_pool_id = aws_cognito_identity_pool.bible_app_identity_pool.id
    roles = {
        "authenticated" = aws_iam_role.authenticated_role.arn
    }
}
