from aws_cdk import (
    aws_secretsmanager as secretsmanager,
    SecretValue
)
from constructs import Construct

class ApiKeySecret(Construct):
    def __init__(self, scope: Construct, id: str, secret_name: str, api_key: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.secret = secretsmanager.Secret(self, "ApiKeySecret", 
            secret_name=secret_name,
            description="API Key for accessing the service",
            secret_string_value=SecretValue.unsafe_plain_text(api_key)
        )
