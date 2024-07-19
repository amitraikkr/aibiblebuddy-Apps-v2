from aws_cdk import (
    aws_lambda as _lambda,
    aws_iam as iam,
    aws_s3_assets as s3_assets,
    aws_apigateway as apigateway,
    Stack,
)

from constructs import Construct

class ContactEmailAppStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.lambda_role = iam.Role(self, "LambdaSESSendEmailRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole"),
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonSESFullAccess")
            ])
        
        self.lambda_function = _lambda.Function(self, "SESSendEmailFunction",
            runtime=_lambda.Runtime.NODEJS_18_X,
            handler="sendContactEmail.handler",
            code=_lambda.Code.from_asset('src'),
            role=self.lambda_role,
            environment={
                'SENDER_EMAIL':'your_verified_email@example.com'
            })
        
        self.api = apigateway.RestApi(self, "EmailApi",
            rest_api_name="Contact Email Service",
            description="This service send email from Contact",
        )

        #Create an API with specific key value
        api_key = self.api.add_api_key("ApiKeyContactEmail",
            value="Emai1aw1tra1m0s3sra1m33nura1"
            )
        
        usage_plan = self.api.add_usage_plan("UsagePlanEmail",
            name="Basic",
            api_stages=[apigateway.UsagePlanPerApiStage(
                api = self.api,
                stage=self.api.deployment_stage
            )],
            throttle=apigateway.ThrottleSettings(
                rate_limit=100,
                burst_limit=200,
            )
            )
        usage_plan.add_api_key(api_key)

        #Define the lambda integration with proxy=True

        lambda_integration = apigateway.LambdaIntegration(
            self.lambda_function,
            proxy=True
        )

        resource = self.api.root.add_resource("email")
        
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
