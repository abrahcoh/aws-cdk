import * as fs from 'fs';
import { dropUndefined } from './private/object';

/**
 * All possible filter operations
 */
export enum InsightsRuleBodyFilterOperations {

  /**
   * Configures filter to check if match field is "IN" a set of strings
   */
  IN= 'In',

  /**
   * Configures filter to check if match field is "NOT_IN" a set of strings
   */
  NOT_IN = 'NotIn',

  /**
   * Configures filter to check if match field "STARTS_WITH" any of a set of strings
   */
  STARTS_WITH = 'StartsWith',

  /**
   * Configures filter to check if match field is "GREATER_THAN" a numerical value
   */
  GREATER_THAN= 'GreaterThan',

  /**
   * Configures filter to check if a match field is "LESS_THAN" a numerical value
   */
  LESS_THAN = 'LessThan',

  /**
   * Configures filter to check if a match field is "EQUAL_TO" a numerical value
   */
  EQUAL_TO = 'EqualTo',

  /**
   * Configures filter to check if a match field is "NOT_EQUAL_TO" a numerical value
   */
  NOT_EQUAL_TO = 'NotEqualTo',

  /**
   * Configures filter to check if a match field "IS_PRESENT" in a log stream
   */
  IS_PRESENT = 'IsPresent',

  /**
   * For compilation purposes, do not use
   */
  UNDEFINED = 'UNDEFINED'
}

/**
 * All possible qualifiers to define the statistic of observation
 */
export enum InsightsRuleBodyFilterStatistics {
  /**
   * reflects the aggregated value of all occurences of a metric in an entry
   */
  SUM = 'Sum',

  /**
   * reflects the number of occurences for a given metric in the entry
   */
  COUNT = 'Count',

  /**
   * reflects the aggregated sum for the metric values in an entry divided by the number of occurences for the metrics in the
   * same entry
   */
  AVERAGE = 'Average'
}

/**
 * Properties of an Insights Rule Filter
 */
export interface IInsightsRuleBodyFilter {
  /**
     * Field of the log data the filter will act upon
     */
  filterMatch: string;

  /**
     * Filter operation chosen from InsightsRuleBodyFilterOperations
     */
  filterOperation: InsightsRuleBodyFilterOperations;

  /**
     * Value that the filter operation will compare the match field against
     * Currently, only number, string[], and boolean are valid data types for the filter operations
     */
  filterOperand: number | string[] | boolean;

  /**
     * Only activates if operand is a text type. If set, will ignore case when comparing match against operand
     *
     * @default - false, so will not ignore case
     */
  filterIgnoreCase?: boolean;

  /**
     * Determines how to treat metrics that occur multiple times
     *
     * @default - None, Will default to AVERAGE in CloudFormation
     */
  filterStatistic?: InsightsRuleBodyFilterStatistics;
}

/**
 * Used to create Filters via a builder interface
 */
export class InsightsRuleBodyFilterBuilder implements IInsightsRuleBodyFilter {
  private MAX_OPERAND_ARR_LEN = 10;
  private MIN_OPERAND_ARR_LEN = 1;
  private OPERAND_UNDEFINED = [];

  public filterMatch: string;
  public filterOperand: number | string[] | boolean;
  public filterOperation: InsightsRuleBodyFilterOperations;
  public filterIgnoreCase?: boolean;
  public filterStatistic?: InsightsRuleBodyFilterStatistics;

  constructor(match: string) {
    this.filterMatch = match;

    //these are only initialized to dummy values for compilation purposes
    this.filterOperation = InsightsRuleBodyFilterOperations.UNDEFINED;
    this.filterOperand = this.OPERAND_UNDEFINED;
  }

  /**
   * Configures the filter builder to set the filter operation to "IN"
   * @param operand the values the match field can be to satisfy the filter
   */
  public in(operand: string[]): InsightsRuleBodyFilterBuilder {
    this.checkAndErrorIfBadOperand(operand);
    this.filterOperation = InsightsRuleBodyFilterOperations.IN;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "NOT_IN"
   * @param operand the values the match field cannot be to satisfy the filter
   */
  public notIn(operand: string[]): InsightsRuleBodyFilterBuilder {
    this.checkAndErrorIfBadOperand(operand);
    this.filterOperation = InsightsRuleBodyFilterOperations.NOT_IN;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "STARTS_WITH"
   * @param operand the values the match field can start with to satisfy the fitler
   */
  public startsWith(operand: string[]): InsightsRuleBodyFilterBuilder {
    this.checkAndErrorIfBadOperand(operand);
    this.filterOperation = InsightsRuleBodyFilterOperations.STARTS_WITH;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "GREATER_THAN"
   * @param operand the value the match field must be greater than to satisfy the filter
   */
  public greaterThan(operand: number): InsightsRuleBodyFilterBuilder {
    this.filterOperation = InsightsRuleBodyFilterOperations.GREATER_THAN;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "LESS_THAN"
   * @param operand the value the match field must be less than to satisfy the filter
   */
  public lessThan(operand: number): InsightsRuleBodyFilterBuilder {
    this.filterOperation = InsightsRuleBodyFilterOperations.LESS_THAN;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "EQUAL_TO"
   * @param operand the value the match field must be equal to to satisfy the filter
   */
  public equalTo(operand: number): InsightsRuleBodyFilterBuilder {
    this.filterOperation = InsightsRuleBodyFilterOperations.EQUAL_TO;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "NOT_EQUAL_TO"
   * @param operand the value the match field must not be equal to to satisfy the filter
   */
  public notEqualTo(operand: number): InsightsRuleBodyFilterBuilder {
    this.filterOperation = InsightsRuleBodyFilterOperations.NOT_EQUAL_TO;
    this.filterOperand = operand;

    return this;
  }

  /**
   * Configures the filter builder to set the filter operation to "IS_PRESENT"
   * @param operand whether the match field needs to be present
   */
  public isPresent(operand: boolean): InsightsRuleBodyFilterBuilder {
    this.filterOperation = InsightsRuleBodyFilterOperations.IS_PRESENT;
    this.filterOperand = operand;

    return this;
  }


  /**
   * Configures the filter builder to set the filter to ignore case
   * @param ignoreCase whether to ignore case
   */
  public ignoreCase(ignoreCase: boolean): InsightsRuleBodyFilterBuilder {
    this.filterIgnoreCase = ignoreCase;

    return this;
  }

  /**
   * Configures the filter builder to set a statistic for the filter
   * @param statistic the statistic for the filter
   */
  public statistic(statistic: InsightsRuleBodyFilterStatistics) {
    this.filterStatistic = statistic;

    return this;
  }

  /**
   * Converts a filter builder to an IFilter
   */
  public toFilter(): IInsightsRuleBodyFilter {
    if (this.filterOperation == InsightsRuleBodyFilterOperations.UNDEFINED) {
      throw new Error(`Operation cannot be undefined but was given an operation of ${this.filterOperation} `+
          `and an operand of ${this.filterOperand}. Must use operation method (.in, .startsWith, etc) before toFilter().`);
    }

    return dropUndefined({
      filterMatch: this.filterMatch,
      filterOperation: this.filterOperation,
      filterOperand: this.filterOperand,
      filterIgnoreCase: this.filterIgnoreCase,
      filterStatistic: this.filterStatistic,
    });
  }

  /**
     * Currently, all string[] operands can only have a max length of 10. This checks if that is satisfied,
     * otherwise, it will error out
     * @param operand the value the match is compared against in the filter
     * @private
     */
  private checkAndErrorIfBadOperand(operand: string[]) {
    if (operand.length > this.MAX_OPERAND_ARR_LEN || operand.length < this.MIN_OPERAND_ARR_LEN) {
      throw new Error(`Operand array has a max length of ${this.MAX_OPERAND_ARR_LEN} and a minimum length of `+
        `${this.MAX_OPERAND_ARR_LEN} but given operand length was ${operand.length}`);
    }
  }

}

/**
 * Class that defines the static public APIs for adding filters to a rule body
 */
export class InsightsRuleBodyFilter {

  /**
     * Converts a IInsightsRuleBodyFilter interface to filter JSON to be used in a rule body
     * @param filter the filter interface one wishes to use in a rule body
     */
  public static fromFilter(filter: IInsightsRuleBodyFilter): any {
    return dropUndefined({
      Match: filter.filterMatch,
      [filter.filterOperation]: filter.filterOperand,
      IgnoreCase: filter.filterIgnoreCase,
      Statistic: filter.filterStatistic,
    });
  }

}

/**
 * Properties of an Insights Rule Contribution
 */
export interface IInsightsRuleContribution {
  /**
   * Array up to four log fields that are used as dimensions to classify contributors
   */
  keys: string[],

  /**
   * Specify this only when specifying SUM as AggregateOn and for log fields with numerical values. Used to sort
   * contributors by the sum of the values of their fields in valueOf
   *
   * Also, this is not camelcase, as 'valueOf?' for some reasons gives a compiler error that I cannot find online
   *
   * @default - none, no contributor sorting will occur
   */
  valueof?: string,

  /**
   * Array up to four filters to narrow the log events that are included in the report
   * If multiple are provided, Contributor Insights evaluates them with a logical AND operator
   *
   * @default - none, no narrowing of log events
   */
  filters?: any[]
}

/**
 * Properties of an Insights Rule Schema
 */
export interface IInsightsRuleSchema {
  /**
   * Insights Rule Body schema name
   */
  name: string,

  /**
   * Insights Rule Body schema version
   */
  version: number
}

/**
 * An enum that describes the possible values for AggregateOn field in an Insights Rule Body
 */
export enum InsightsRuleAggregates {
  /**
   * Aggregates the report based on the count of occurances of the contribution
   */
  COUNT = 'Count',

  /**
   * Aggregates the report based on the sum of the values of the field specified in valueOf
   */
  SUM = 'Sum'
}

/**
 * An enum that describes the possible log formats for a CloudWatch log rule
 */
export enum InsightsRuleLogFormats {
  /**
   * Log groups emit data with a JSON format
   */
  JSON = 'JSON',

  /**
   * Log groups emit data with a CLF format
   */
  CLF = 'CLF'
}

/**
 * Common properties to all Insights Rule Bodies (besides string rule bodies)
 */
export interface IInsightsRuleBody {
  /**
   * Defines the name and version of the rule body schema
   */
  schema?: IInsightsRuleSchema,

  /**
   * Defines all properties of the contribution for the rule body
   */
  contribution: IInsightsRuleContribution,

  /**
   * Defines how the rule will aggregate the data for the report
   */
  aggregateOn?: InsightsRuleAggregates
}

/**
 * Properties of a version 1 CloudWatch Logs rule body
 */
export interface ICloudWatchLogsV1RuleBody extends IInsightsRuleBody{

  /**
   * Defines the log groups the rule will pull data from
   */
  logGroups: string[],

  /**
   * Defines the format of the log group data
   *
   * @default - JSON if Fields undefined, else CLF
   */
  logFormat?: InsightsRuleLogFormats,

  /**
   * Defines the aliases for log keys for CLF formatted log groups
   */
  fields?: {[index: string] : string}
}

/**
 * Class that defines the static import methods for a version 1 CloudWatch Logs rule body
 */
export class CloudWatchLogsV1RuleBody {

  /**
   * Creates a version 1 CloudWatch logs rule body from an ICloudWatchLogsV1RuleBody interface
   * @param ruleBody interface that describes the rule body
   */
  public static fromRuleBody(ruleBody: ICloudWatchLogsV1RuleBody): string {
    ruleBody = this.setRuleBodyDefaults(ruleBody);
    this.validateRuleBody(ruleBody);
    return JSON.stringify(
      dropUndefined(ruleBody),
    );
  }

  /**
   * Creates a version 1 CloudWatch logs rule body from contents stored in a file
   * @param filepath location of file with a version 1 CloudWatch logs rule body
   * @param encoding encoding of file
   */
  public static fromFile(filepath: string, encoding : BufferEncoding = 'utf8'): string {
    /**
     * TODO: Need to inquire on what the policy is for try/catch. I know the CDK does not like try/catch as no error should
     * be recoverable; however, there may be some merit for catching, if only to give better error messages
     */

    //If this fails, there is no better error message we can give, so allow it to not be catched
    let ruleBodyString : string = fs.readFileSync(filepath, { encoding: encoding, flag: 'r' });

    //If this fails, we may be able to give a better error message than what this provides. Look at TODO above.
    let ruleBody : ICloudWatchLogsV1RuleBody = JSON.parse(ruleBodyString);

    ruleBody = this.setRuleBodyDefaults(ruleBody);
    this.validateRuleBody(ruleBody);
    return JSON.stringify(ruleBody);
  }

  private static readonly MAX_KEYS: number = 4;
  private static readonly MIN_KEYS: number = 0;
  private static readonly SCHEMA: IInsightsRuleSchema = { name: 'CloudWatchLogs', version: 1 };
  private static readonly MAX_FILTERS: number = 4;

  /**
   * Validates that the rule body conforms to the restrictions of a version 1 CloudWatch logs rule body.
   * If it does not, it throws an error. Otherwise, nothing happens.
   * @param ruleBody interface that describes the rule body
   * @private
   */
  private static validateRuleBody(ruleBody: ICloudWatchLogsV1RuleBody): void {
    //validating the rule proper for a proper schema
    if (ruleBody.schema != this.SCHEMA) {
      throw new Error(`A version 1 CloudWatch Log rule body can only have a schema ${this.SCHEMA}, but ${ruleBody.schema} ` +
        'was given');
    }

    //validating the rule body for proper amount of keys
    if (ruleBody.contribution.keys.length > this.MAX_KEYS || ruleBody.contribution.keys.length < this.MIN_KEYS) {
      throw new Error(`A version 1 CloudWatch Log Rule body can have between ${this.MIN_KEYS} to ${this.MAX_KEYS} keys, but `+
          `${ruleBody.contribution.keys.length} was given.`);
    }

    //validating the rule body for proper amount of filters, if given
    if (ruleBody.contribution.filters && ruleBody.contribution.filters.length > this.MAX_FILTERS) {
      throw new Error(`A version 1 CloudWatch Log Rule body can up to ${this.MAX_FILTERS} , but `+
          `${ruleBody.contribution.keys.length} was given.`);
    }
  }

  /**
   * Sets the defaults as needed for a given version 1 CloudWatch logs rule body
   * @param ruleBody interface that describes the rule body
   * @private
   */
  private static setRuleBodyDefaults(ruleBody: ICloudWatchLogsV1RuleBody): ICloudWatchLogsV1RuleBody {
    /**
     * If a log format is given, it will be used.
     * Otherwise, if Fields has a value, CLF will be chosen. Else, JSON will be chosen.
     */
    ruleBody.logFormat = ruleBody.logFormat || (ruleBody.fields? InsightsRuleLogFormats.CLF : InsightsRuleLogFormats.JSON);

    /**
     * If a schema is given, even if it is wrong (it'll be caught in validateRuleBody), it will be used.
     * TODO: It might just be better to always set it to the proper schema regardless of what a user inputs
     * Otherwise, this rule body's schema will be given.
     */
    ruleBody.schema = ruleBody.schema || this.SCHEMA;

    /**
     * For aggregate on, if a value is given, it will be used (even if it doesn't make sense).
     * Otherwise, if a value if NOT given, if valueOf is defined, SUM will be chosen (as the valueOf parameter only makes
     * sense to set it SUM is chosen for AggregateOn). Otherwise, COUNT is chosen.
     */
    ruleBody.aggregateOn = ruleBody.aggregateOn ||
        (ruleBody.contribution.valueof ? InsightsRuleAggregates.SUM : InsightsRuleAggregates.COUNT);

    return ruleBody;
  }

}