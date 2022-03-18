# Deploy River to AWS using AWS Cloud Development Kit

These are the steps that you'll probably need to run in order to deploy the infrastructure to your AWS account. Most of steps simply installs the depencies needed and could be simplified by using an `npm` script. I'm keeping it like this for now so that we can easily troubleshoot as needed.

## Deployment guidelines

### Prerequisites

- an AWS account
- AWS CLI installed and configured on your local machine
- npm installed on your local machine

### Steps

- Clone this repo to your local machine using `git clone`.
- From the root directory, run `npm install` to install the dependencies.
- Our lambda function also has its own dependencies (the `socket.io-emitter` module): `cd publisher-lambda` and `npm install` once again.

If you run into difficulties, you might have to run the following commands:

- `npm install -g aws-cdk`: this install the CLI for using the Cloud Development Kit globally on your system.
- `cdk bootstrap`: this might be needed to bundle up the lambda with its dependencies. You can run the command from the root directory if needed (you'll be instructed to do so if there's an issue).

You should be all set up, now for the fun part!

- From the root directory, you can run `cdk synth`

This is not strictly needed, but it will let you know if something is wrong. This command emits the synthesized CloudFormation templates and you can have a look at them in the newly created `cdk.out` folder. You should see two warnings about security (we can ignore those for now) followed by `Successfully synthesized ...`. Note that the command `cdk list` can be issued at any time and will output a list of stacks. If you run that command, you should see:

```
shared-resources
publisher
river-server
```

- To deploy, from the root directory run `cdk deploy "*"` (with the quotes, they are needed!): this will start the deployment of all our stacks.

This will start the deployment of our infrastructure on AWS. It will take a while (~10-15 minutes). The command line will prompt you a couple of times - simply say `y`. You can follow the progression of the deployment from your AWS account by navigating to the CloudFormation page.

### Testing/Troubleshooting

Hopefully, this will go well! If that's the case, at the end of the process you will see two links in your terminal. Clicking on any of those should take you to the Load Balancer and you should see the demo app.

If you feel like doing some more thorough testing, you can retrieve the APIGateway address from your console and ping it with either curl or Postman.

If the process gets stuck for too long or the end result is not as expected, we'll debug together. You should try it in your own AWS account as it will probably conflict with other resources in our shared account.

In any case, know that the command `cdk destroy "*"` will roll back all the deployment for you. Even in case of success, you'll probably want to roll back the process so that you don't start paying Elasticache fees :)

Note that both the `cdk deploy` and `cdk destroy` commands can be used to deploy/destroy one specific stack, i.e. running `cdk destroy ws-server` will undo only that specific stack while leaving the other resources standing.

### Useful commands

- `cdk synth` emits the synthesized CloudFormation template
- `cdk deploy` deploys the specified stack(s) to your default AWS account/region
- `cdk diff` compares deployed stack with current state
- `cdk destroy` destroys the specified stack(s) from your default AWS account/region

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

You can add the following flag to the `deploy` command in order to save the deployment outputs in a `.json` file:

```
cdk deploy --outputs-file my-outputs.json
```
