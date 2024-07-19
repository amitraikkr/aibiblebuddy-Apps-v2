from aws_cdk import (
    Stack,
)
from constructs import Construct
from .secrets_construct import ApiKeySecret
from .user_data_construct import UserDataConstruct

class UserSaveModuleStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        api_key = "aw1tra1m0s3sra1m33nura1"

        api_key_secret = ApiKeySecret(self, "ApiKeySecret",
            secret_name="prod/apikey/2024/blbapp",
            api_key=api_key)
        
        user_data_construct = UserDataConstruct(self, "UserDataConstruct")


