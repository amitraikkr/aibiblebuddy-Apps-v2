#!/usr/bin/env python3
import os
import aws_cdk as cdk

from user_save_module.user_save_module_stack import UserSaveModuleStack


app = cdk.App()
UserSaveModuleStack(app, "UserSaveModuleStack")

app.synth()
