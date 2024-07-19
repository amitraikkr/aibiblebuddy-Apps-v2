#!/usr/bin/env python3
import os

import aws_cdk as cdk

from contact_email_app.contact_email_app_stack import ContactEmailAppStack


app = cdk.App()
ContactEmailAppStack(app, "ContactEmailAppStack")
app.synth()
