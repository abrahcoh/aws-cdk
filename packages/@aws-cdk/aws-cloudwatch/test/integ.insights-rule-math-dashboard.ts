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

const insightWidget = new cloudwatch.InsightRuleWidget({
  rule: rule,
});

const alarm = new cloudwatch.Alarm(stack, 'asd', {
  metric: rule.uniqueContributors(),
  threshold: 10,
  evaluationPeriods: 5,
});

const dash = new cloudwatch.Dashboard(stack, 'wickedDash', {
  dashboardName: 'another-wild-dashboard',
});

dash.addWidgets(graph, insightWidget, new cloudwatch.AlarmWidget({
  alarm: alarm,
}));

app.synth();
