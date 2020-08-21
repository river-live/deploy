const cdk = require("@aws-cdk/core");
const ec2 = require("@aws-cdk/aws-ec2");
const ecs = require("@aws-cdk/aws-ecs");
const ecs_patterns = require("@aws-cdk/aws-ecs-patterns");
const apiGateway = require("@aws-cdk/aws-apigatewayv2");
const lambda = require("@aws-cdk/aws-lambda");
const redis = require("./redis");
const { randomBytes } = require("crypto");

// Stack holding all the shared resources
class SharedResources extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create the network to run everything i
    this.vpc = new ec2.Vpc(this, "river-vpc", {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create an ECS cluster
    this.cluster = new ecs.Cluster(this, "river-cluster", {
      vpc: this.vpc,
    });

    // Create the Redis cluster
    this.redis = new redis.Cluster(this, "redis", { vpc: this.vpc });
  }
}

// API Gateway + Lambda function used to publish events from backend services
class Publisher extends cdk.Stack {
  constructor(parent, id, props) {
    super(parent, id, props);

    // Create the HTTP API Gateway to handle POST requests
    const httpApi = new apiGateway.HttpApi(this, "http-api");

    // Create an api key as a unique identifier
    this.id = randomBytes(16).toString("hex");

    // Create the lambda responsible for publishing events
    const publisher = new lambda.Function(this, "publisher-lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "publisher.handler",
      code: lambda.Code.asset("./publisher-lambda"),
      timeout: cdk.Duration.seconds(30),
      vpc: props.vpc,
      environment: {
        API_KEY: this.id,
        REDIS_HOST: props.redis.cluster.attrRedisEndpointAddress,
        REDIS_PORT: props.redis.cluster.attrRedisEndpointPort,
      },
    });

    publisher.connections.allowToDefaultPort(props.redis);

    // Create the API Gateway integration
    const publisherIntegration = new apiGateway.LambdaProxyIntegration({
      handler: publisher,
    });

    httpApi.addRoutes({
      path: "/publish",
      methods: [apiGateway.HttpMethod.POST],
      integration: publisherIntegration,
    });

    new cdk.CfnOutput(this, "apiKey", {
      value: this.id,
      exportName: "api-key",
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: httpApi.url + "publish",
      exportName: "api-url",
    });
  }
}

class WebSocketServer extends cdk.Stack {
  constructor(parent, id, props) {
    super(parent, id, props);

    this.id = randomBytes(32).toString("hex");

    // Create a load-balanced Fargate service and make it public
    const riverService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "river-server",
      {
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry("catherinemond/debug-server"),
          environment: {
            APP_ID: `${this.id}`,
            REDIS_HOST: props.redis.cluster.attrRedisEndpointAddress,
            REDIS_PORT: props.redis.cluster.attrRedisEndpointPort,
          },
          enableLogging: true,
        },
        cluster: props.cluster,
        cpu: 256,
        desiredCount: 1,
        memoryLimitMiB: 512,
        publicLoadBalancer: true,
      }
    );

    riverService.service.connections.allowToDefaultPort(props.redis);

    new cdk.CfnOutput(this, "loadBalancerUrl", {
      value: riverService.loadBalancer.loadBalancerDnsName,
    });

    new cdk.CfnOutput(this, "secret", {
      value: this.id,
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: cdk.Fn.importValue("api-url"),
    });

    new cdk.CfnOutput(this, "apiKey", {
      value: cdk.Fn.importValue("api-key"),
    });
  }
}

class RiverApp extends cdk.App {
  constructor(argv) {
    super(argv);

    const sharedResources = new SharedResources(this, "shared-resources");

    const publisher = new Publisher(this, "publisher", {
      vpc: sharedResources.vpc,
      redis: sharedResources.redis,
    });

    const server = new WebSocketServer(this, "river-server", {
      cluster: sharedResources.cluster,
      redis: sharedResources.redis,
    });
  }
}

new RiverApp().synth();
