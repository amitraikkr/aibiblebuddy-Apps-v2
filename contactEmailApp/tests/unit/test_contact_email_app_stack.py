import aws_cdk as core
import aws_cdk.assertions as assertions

from contact_email_app.contact_email_app_stack import ContactEmailAppStack

# example tests. To run these tests, uncomment this file along with the example
# resource in contact_email_app/contact_email_app_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = ContactEmailAppStack(app, "contact-email-app")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
