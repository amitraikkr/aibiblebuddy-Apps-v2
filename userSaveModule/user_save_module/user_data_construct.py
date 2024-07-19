from aws_cdk import (
    aws_dynamodb as dynamodb,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    RemovalPolicy,
)
from constructs import Construct

class UserDataConstruct(Construct):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.table = dynamodb.Table(self, "UserDataTable",
            partition_key=dynamodb.Attribute(name="username", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="email", type=dynamodb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY,
        )

        self.lambda_function = _lambda.Function(self, "UserDataLambda",
            runtime=_lambda.Runtime.NODEJS_18_X,
            handler="createUserLambda.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                'TABLE_NAME': self.table.table_name
        })
        
        self.table.grant_read_write_data(self.lambda_function)

        self.api = apigateway.RestApi(self, "UserDataApi",
            rest_api_name="User Data Service",
            description="This service saves user data",
        )

        # Create an API Key with a specific value
        api_key = self.api.add_api_key("ApiKey", 
            value="aw1tra1m0s3sra1m33nura1"
        )

        usage_plan = self.api.add_usage_plan("UsagePlan", 
            name="Basic",
            api_stages=[apigateway.UsagePlanPerApiStage(
                api=self.api,
                stage=self.api.deployment_stage
            )],
            throttle=apigateway.ThrottleSettings(
                rate_limit=100,
                burst_limit=200,
            )
        )

        usage_plan.add_api_key(api_key)

        # Define the Lambda integration with proxy=True
        lambda_integration = apigateway.LambdaIntegration(
            self.lambda_function,
            proxy=True
        )
        
        resource = self.api.root.add_resource("user")

        # Add OPTIONS method for CORS preflight request
        resource.add_method("OPTIONS",
            apigateway.MockIntegration(
                integration_responses=[
                    apigateway.IntegrationResponse(
                        status_code="200",
                        response_parameters={
                            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                            'method.response.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
                            'method.response.header.Access-Control-Allow-Origin': "'*'",
                            'method.response.header.Access-Control-Allow-Credentials': "'true'",
                        },
                    )
                ],
                request_templates={"application/json": "{\"statusCode\": 200}"}
            ),
            method_responses=[
                apigateway.MethodResponse(
                    status_code="200",
                    response_parameters={
                        'method.response.header.Access-Control-Allow-Headers': True,
                        'method.response.header.Access-Control-Allow-Methods': True,
                        'method.response.header.Access-Control-Allow-Origin': True,
                        'method.response.header.Access-Control-Allow-Credentials': True,
                    }
                )
            ]
        )

        # Add POST method with API key requirement and CORS headers
        resource.add_method("POST", lambda_integration, api_key_required=True,
            method_responses=[
                apigateway.MethodResponse(
                    status_code="200",
                    response_parameters={
                        'method.response.header.Access-Control-Allow-Origin': True,
                        'method.response.header.Access-Control-Allow-Credentials': True,
                    }
                )
            ]
        )