const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
AWS.config.logger = console;
const fs = require("fs");
const { promisify } = require("util");

const cloudformation = new AWS.CloudFormation({ apiVersion: "2010-05-15" });

const cluster = fs.readFileSync("recipes/cluster.yml", "utf-8");
const resources = fs.readFileSync("recipes/resources.yml", "utf-8");
const chatservice = fs.readFileSync("recipes/chat-service.yml", "utf-8");

const clusterParams = {
  StackName: "Cluster",
  TemplateBody: cluster,
  Capabilities: ["CAPABILITY_IAM"],
};

const resourcesParams = {
  StackName: "Redis",
  TemplateBody: resources,
  Capabilities: ["CAPABILITY_IAM"],
};

const chatserviceParams = {
  StackName: "Chat-Service",
  TemplateBody: chatservice,
  Capabilities: ["CAPABILITY_IAM"],
};

const templates = { resourcesParams, chatserviceParams };

const asyncCreateStack = promisify(
  cloudformation.createStack.bind(cloudformation)
);

// TODO look into setting up a setInterval to wait until one stack is complete before moving on to the next.
// we can use https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#stackCreateComplete-waiter
// to wait for the stack create complete before moving on to the next stack

const createStack = async ({ resourcesParams, chatserviceParams }) => {
  try {
    // let data = await asyncCreateStack(resourcesParams);
    // console.log(data);
    // console.log("Redis Resource created.");
    let data = await asyncCreateStack(chatserviceParams);
    console.log(data);
    console.log("Chat service created.");
  } catch (e) {
    console.log(e);
  }
};

createStack(templates);
// createStack(resourcesParams);
// createStack(chatserviceParams);

// cloudformation.createStack(params, (err, data) => {
//   if (err) console.log(err, err.stack);
//   else console.log(data);
// });
