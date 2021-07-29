import * as iam from '@aws-cdk/aws-iam';
import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnInsightRule } from './cloudwatch.generated';
import { MathExpression } from './metric';


/**
 * Properties for defining a Contributor Insights Rule
 */
export interface IInsightRule extends core.IResource {
  /**
     * Contributor Insights Rule Arn (i.e. arn:aws:cloudwatch:<region>:<account-id>:insight-rule:Foo)
     *
     * @attribute
     */
  readonly insightRuleArn: string;

  /**
     * Name of Contributor Insights Rule
     * Name must be insightRule + <attribute>, so with the attribute being RuleName, must be InsightRuleRuleName
     * @attribute
     */
  readonly insightRuleRuleName: string;

  /**
     * Adds an IAM policy statement associated with this rule to an IAM principle's policy
     *
     * @param grantee the principle to grant access to (no-op if undefined)
     * @param actions set of actions to allow
     */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;

  /**
   * Returns a math expression for the number of unique contributors for each datapoint in the rule.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  uniqueContributors(period?: core.Duration): MathExpression;

  /**
   * Returns a math expression the value of the top contributor for each data point in the rule.
   *
   * If this rule aggregates by Count, the top contributor for each data point is the contributor with the most
   * occurrences in that period. If the rule aggregates by Sum, the top contributor is the contributor with the
   * greatest sum in the log field specified by the rule's Value during that period.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  maxContributorValue(period?: core.Duration): MathExpression;

  /**
   * Returns a math expression for the number of data points matched by the rule
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  sampleCount(period?: core.Duration): MathExpression;

  /**
   * Returns a math expression for the sum of the values from all contributors during the time period represented by that data
   * point
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  sum(period?: core.Duration): MathExpression;

  /**
   * Returns a math expression for the minimum value from a single observation during the time period represented
   * by that data point.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  minimum(period?: core.Duration): MathExpression;

  /**
   * Returns a math expression for the number of unique contributors for each datapoint in the rule
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  maximum(period?: core.Duration): MathExpression;

  /**
   * Returns a math expression for the average value from all contributors during the time period represented by that data point.
   * data point.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  average(period?: core.Duration): MathExpression;
}

/**
 * An enum describing all possible metrics for an insight rule
 *
 * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContributorInsights-GraphReportData.html
 */
enum InsightRuleMetricNames {
  /**
   * the number of unique contributors for each data point.
   */
  UNIQUE_CONTRIBUTORS = 'UniqueContributors',

  /**
   * the value of the top contributor for each data point. The identity of the contributor might change for each data point in
   * the graph.
   */
  MAX_CONTRIBUTOR_VALUE = 'MaxContributorValue',

  /**
   * the number of data points matched by the rule
   */
  SAMPLE_COUNT = 'SampleCount',

  /**
   * the sum of the values from all contributors during the time period represented by that data point
   */
  SUM = 'Sum',

  /**
   * the minimum value from a single observation during the time period represented by that data point.
   */
  MINIMUM = 'Minimum',

  /**
   * the maximum value from a single observation during the time period represented by that data point.
   */
  MAXIMUM = 'Maximum',

  /**
   * the average value from all contributors during the time period represented by that data point.
   */
  AVERAGE = 'Average'
}

/**
 * Abstract class whose function is to implement the grant and metric functions, not public/exposed in API
 * Required by contributing guidelines
 */
abstract class InsightRuleBase extends core.Resource implements IInsightRule {

  /**
   * @attribute
   */
  public abstract readonly insightRuleArn: string;

  /**
   * @attribute
   */
  public abstract readonly insightRuleRuleName: string;

  /**
   * Adds an IAM policy statement associated with this rule to an IAM principle's policy
   *
   * @param grantee the principle to grant access to (no-op if undefined)
   * @param actions set of actions to allow
   */
  public grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant {
    return iam.Grant.addToPrincipal({
      grantee: grantee,
      actions: actions,
      resourceArns: [this.insightRuleArn],
      scope: this,
    });
  }

  /**
   * Returns a math expression for the number of unique contributors for each datapoint in the rule.
   */
  public uniqueContributors(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.UNIQUE_CONTRIBUTORS, period);
  }

  /**
   * Returns a math expression the value of the top contributor for each data point in the rule.
   *
   * If this rule aggregates by Count, the top contributor for each data point is the contributor with the most
   * occurrences in that period. If the rule aggregates by Sum, the top contributor is the contributor with the
   * greatest sum in the log field specified by the rule's Value during that period.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  public maxContributorValue(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.MAX_CONTRIBUTOR_VALUE, period);
  }

  /**
   * Returns a math expression for the number of data points matched by the rule
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  public sampleCount(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.SAMPLE_COUNT, period);
  }

  /**
   * Returns a math expression for the sum of the values from all contributors during the time period represented by that data
   * point
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  public sum(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.SUM, period);
  }

  /**
   * Returns a math expression for the minimum value from a single observation during the time period represented
   * by that data point.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  public minimum(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.MINIMUM, period);
  }

  /**
   * Returns a math expression for the number of unique contributors for each datapoint in the rule
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  public maximum(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.MAXIMUM, period);
  }

  /**
   * Returns a math expression for the average value from all contributors during the time period represented by that data point.
   * data point.
   *
   * @param period time interval metric will be aggregate over
   * @default undefined, will be 5 minutes
   */
  public average(period?: core.Duration): MathExpression {
    return this.createMathExpression(InsightRuleMetricNames.AVERAGE, period);
  }

  /**
   * Generates a math expression given a metric name.
   *
   * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContributorInsights-GraphReportData.html for
   * documentation
   * @param metricName name of the insight rule metric
   * @private
   */
  private createMathExpression(metricName: InsightRuleMetricNames, period?: core.Duration): MathExpression {
    return new MathExpression({
      // we need the quotes around both parameters or else CloudWatch will scream
      expression: `INSIGHT_RULE_METRIC('${this.insightRuleRuleName}', '${metricName}')`,
      usingMetrics: {},
      period: period,
    });
  }
}

/**
 * Possible states for Contributor Insights Rule
 */
export enum InsightRuleStates {

  /**
     * Rule is active and will collect and write data
     */
  ENABLED = 'ENABLED',

  /**
     * Rule is inactive and will not collect and write data
     */
  DISABLED = 'DISABLED'
}


/**
 * The properties of a Contributor Insights Rule
 */
export interface InsightRuleProps {

  /**
     * Physical name of the Contributor Insights Rule
     */
  readonly insightRuleName: string;

  /**
     * Rule body of the Contributor Insights Rule
     */
  readonly insightRuleBody: string;

  /**
     * Rule state of the Contributor Insights Rule, can either be ENABLED or DISABLED
     *
     * @default InsightRuleStates.ENABLED, rule will actively collect data and report metrics when left out
     */
  readonly insightRuleState?: InsightRuleStates;
}

/**
 * A Contributor Insights Rule managed by the CDK
 */
export class InsightRule extends InsightRuleBase {

  /**
     * Reference an existing Contributor Insights Rule defined outside of the CDK code, by name
     *
     * @param scope The parent creating construct (usually 'this')
     * @param id The construct's name
     * @param insightRuleName The Contributor Insights Rule's name
     */
  public static fromInsightRuleName(scope: Construct, id: string,
    insightRuleName: string): IInsightRule {
    class Import extends InsightRuleBase {
      public readonly insightRuleArn = core.Stack.of(scope).formatArn({
        service: 'cloudwatch',
        resource: 'insight-rule',
        resourceName: insightRuleName,
      });
      public readonly insightRuleRuleName = insightRuleName;
    }

    return new Import(scope, id);
  }

  /**
     * Reference an existing Contributor Insights Rule defined outside of the CDK code, by arn
     *
     * @param scope The parent creating construct (usually 'this')
     * @param id The construct's name
     * @param InsightRuleArn The Contributor Insights Rule's arn
     */
  public static frominsightRuleArn(scope: Construct, id: string,
    InsightRuleArn:string): IInsightRule {
    class Import extends InsightRuleBase {
      public readonly insightRuleArn = InsightRuleArn;
      public readonly insightRuleRuleName =
      core.Stack.of(scope).parseArn(InsightRuleArn, ':').resourceName!;
    }

    return new Import(scope, id);
  }

  /**
     * Arn of this Contributor Insights Rule
     *
     * @attribute
     */
  public readonly insightRuleArn: string;

  /**
     * Name of this Contributor Insights Rule
     *
     * @attribute
     */
  public readonly insightRuleRuleName: string;

  private readonly ruleBody: string;
  private readonly ruleState?: InsightRuleStates;


  constructor(scope: Construct, id: string, props: InsightRuleProps) {
    super(scope, id, {
      physicalName: props.insightRuleName,
    });

    /**
         * Validate the inputs,
         * We shouldnt need to validate rule state,
         * I know ruleName has some restrictions
         * Rulebody I suppose can go through a json/yaml validator
         */
    this.ruleState = props.insightRuleState;
    this.ruleBody = props.insightRuleBody;

    const insightRule = new CfnInsightRule(this, 'Resource', {
      ruleName: props.insightRuleName,
      ruleBody: this.ruleBody,
      ruleState: this.ruleState || InsightRuleStates.ENABLED,
    });

    /**
         * The arn and name are both attributes of the CFN resource
         * @see https://docs.aws.amazon.com/cdk/api/latest/python/aws_cdk.aws_cloudwatch/CfnInsightRule.html
         */
    this.insightRuleArn = insightRule.attrArn;
    this.insightRuleRuleName = insightRule.attrRuleName;
  }

}


