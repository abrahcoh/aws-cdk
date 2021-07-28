import * as cdk from '@aws-cdk/core';
import { CloudWatchLogsV1Filter, InsightRule, CloudWatchLogsV1RuleBody, CloudWatchLogsV1FilterOperationFunctions } from '../lib';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'aws-cdk-insight-rule-log-group');

new InsightRule(stack, 'myRule', {
  insightRuleName: 'aVeryCoolRule',
  insightRuleBody: CloudWatchLogsV1RuleBody.fromRuleBody({
    fields: { 1: 'requestId' },
    logGroupNames: ['/aws/lambda/*'],
    contribution: {
      keys: ['requestId'],
    },
  }),
});

new InsightRule(stack, 'myRadRule', {
  insightRuleName: 'aRadRule',
  insightRuleBody: CloudWatchLogsV1RuleBody.fromRuleBody({
    logGroupNames: ['/aws/lambda/*'],
    contribution: {
      keys: ['$.requestId'],
      valueof: '$.BytesRecieved',
      filters: [
        CloudWatchLogsV1Filter.fromFilter({
          match: '$.httpMethod',
          operationAndInput: CloudWatchLogsV1FilterOperationFunctions.startsWith('PUT'),
        }),
      ],
    },
  }),
});

app.synth();

