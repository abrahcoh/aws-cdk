import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '../lib';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'aws-cdk-insight-rule-log-group');

const rule = cloudwatch.InsightRule.fromInsightRuleName(stack, 'idk', 'api-path-length');

const pathLengthRange = new cloudwatch.MathExpression({
  expression: 'max - min',
  usingMetrics: {
    max: rule.maximum(),
    min: rule.minimum(),
  },
});

const graph = new cloudwatch.GraphWidget({
  left: [
    pathLengthRange,
  ],
  title: 'Path-Length-Range',
});

const insightWidget = new cloudwatch.InsightRuleWidget({
  rule: rule,
});

const alarm = new cloudwatch.Alarm(stack, 'asd', {
  metric: rule.uniqueContributors(),
  threshold: 5,
  evaluationPeriods: 5,
});

const dash = new cloudwatch.Dashboard(stack, 'wickedDash', {
  dashboardName: 'Path-Length',
});

dash.addWidgets(graph, insightWidget, new cloudwatch.AlarmWidget({
  alarm: alarm,
}));

app.synth();
