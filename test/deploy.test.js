const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const Deploy = require('../lib/deploy-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Deploy.DeployStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
