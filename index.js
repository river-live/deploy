const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
AWS.config.logger = console;
const fs = require("fs");
const { promisify } = require("util");

const cloudformation = new AWS.CloudFormation({ apiVersion: "2010-05-15" });

// const asyncReadFile = promisify(fs.readFile.bind(fs));

// const getFile = async (path, encoding = "utf-8") => {
//   try {
//     const file = await asyncReadFile(path, encoding);
//     return file;
//   } catch (e) {
//     console.log(e);
//   }
// };

const template = fs.readFileSync("s3.yml", "utf-8");
// const template = getFile("s3.yml");
// console.log(template);

const params1 = {
  StackName: "test-s3-bucket1",
  TemplateBody: template,
  Capabilities: ["CAPABILITY_IAM"],
};

const params2 = {
  StackName: "test-s3-bucket2",
  TemplateBody: template,
  Capabilities: ["CAPABILITY_IAM"],
};

const asyncCreateStack = promisify(
  cloudformation.createStack.bind(cloudformation)
);

const createStack = async (params) => {
  try {
    const data = await asyncCreateStack(params);
    console.log(data);
  } catch (e) {
    console.log(e);
  }
};

createStack(params1);
createStack(params2);

// cloudformation.createStack(params, (err, data) => {
//   if (err) console.log(err, err.stack);
//   else console.log(data);
// });
