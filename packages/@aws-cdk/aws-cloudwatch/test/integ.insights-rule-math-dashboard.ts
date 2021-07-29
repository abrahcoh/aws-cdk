import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '../lib';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'aws-cdk-insight-rule-log-group');

const rule = cloudwatch.InsightRule.fromInsightRuleName(stack, 'idk', 'aRule');

const graph = new cloudwatch.GraphWidget({
  left: [
    rule.sum(),
    rule.maximum(),
    rule.uniqueContributors(),
    rule.sampleCount(),
    rule.minimum(),
    rule.average(),
    rule.maxContributorValue(),
  ],
  title: 'WickedRule',
});

const dash = new cloudwatch.Dashboard(stack, 'wickedDash', {
  dashboardName: 'my-wild-dashboard',
});

dash.addWidgets(graph);

app.synth();
