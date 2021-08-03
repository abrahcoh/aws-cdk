import { expect, haveResource, haveResourceLike } from '@aws-cdk/assert-internal';
import { Stack } from '@aws-cdk/core';
import { Test } from 'nodeunit';
import { InsightRule, InsightRuleStates, CustomRuleBody } from '../lib';

const emptyRuleBody = CustomRuleBody.fromRuleBody({});

export = {
  'In InsightRules, Testing only that all parameters are in template'(test: Test) {

    //WHEN
    const stack = new Stack();
    new InsightRule(stack, 'rule', {
      insightRuleName: 'rule1',
      insightRuleBody: emptyRuleBody,
      insightRuleState: InsightRuleStates.ENABLED,
    });

    //THEN
    expect(stack).to(haveResource('AWS::CloudWatch::InsightRule', {
      RuleName: 'rule1',
      RuleBody: '{}',
      RuleState: 'ENABLED',
    }));

    test.done();
  },

  'In InsightRules, Testing that RuleState is ENABLED when left out' (test: Test) {
    //WHEN
    const stack = new Stack();
    new InsightRule(stack, 'rule2', {
      insightRuleName: 'rule2',
      insightRuleBody: CustomRuleBody.fromRuleBody(emptyRuleBody),
    });

    //THEN
    expect(stack).to(haveResourceLike('AWS::CloudWatch::InsightRule', {
      RuleName: 'rule2',
      RuleBody: '{}',
      RuleState: 'ENABLED',
    }));

    test.done();
  },

  'In InsightRules, Testing that RuleState is DISABLED when made so' (test: Test) {
    //WHEN
    const stack = new Stack();
    new InsightRule(stack, 'rule2', {
      insightRuleName: 'rule3',
      insightRuleBody: CustomRuleBody.fromRuleBody(emptyRuleBody),
      insightRuleState: InsightRuleStates.DISABLED,
    });

    //THEN
    expect(stack).to(haveResource('AWS::CloudWatch::InsightRule', {
      RuleName: 'rule3',
      RuleBody: '{}',
      RuleState: 'DISABLED',
    }));

    test.done();
  },
}