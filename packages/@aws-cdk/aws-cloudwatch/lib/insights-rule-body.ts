import * as fs from 'fs';
import { dropUndefined } from './private/object';

/**
 * All possible filter operations
 */
enum InsightsRuleBodyFilterOperations {

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
  IS_PRESENT = 'IsPresent'
}

/**
 * Defines the filter operation and input for an Insights Rule Body
 *
 * In every filter, there is a line that defines the operation and input like "In" : ['this', 'that', 'there'],
 * where "In" is the operation and "['this', 'that', 'there']" is the operand.
 *
 * This type provides a convinient way of enforcing the operation for users creating filters
 */
export type InsightsRuleBodyFilterOperationAndInput = {
  [operation : string]: string[] | number | boolean;
}

/**
 * Properties of an Insights Rule Filter, not exported as it is a base interface for other schema filter interfaces to inherit
 */
interface IInsightsRuleBodyFilter {

  /**
     * Field of the log data the filter will act upon
     */
  match: string,

  /**
     * Filter operation chosen from InsightsRuleBodyFilterOperations
     */
  operationAndInput: InsightsRuleBodyFilterOperationAndInput
}

/**
 * Properties of a version 1 CloudWatchLogs Rule Body filter. It's the same as the base filter interface.
 * Added for future flexibility and inheritance purposes
 */
export interface ICloudWatchLogV1RuleBodyFilter extends IInsightsRuleBodyFilter{
}

/**
 * A base class that defines the common filter operations for all schemas
 */
class InsightsRuleBodyFilterOperationFunctions {

  /**
   * Creates an "In" filter operation JSON for Insights Rule Bodies
   *
   * For example, in('here', 'orThere') produces {"In" : ["here", "orThere"]}
   * @param operand string inputs to the filter operation
   */
  public static in(...operand : string[]) : InsightsRuleBodyFilterOperationAndInput {
    this.validateTextOperation(InsightsRuleBodyFilterOperations.IN, operand);
    return {
      [InsightsRuleBodyFilterOperations.IN]: operand,
    };
  }

  /**
   * Creates a "NotIn" filter operation JSON for Insights Rule Bodies
   *
   * For example, NotIn('here', 'orThere') produces {"NotIn" : ["here", "orThere"]}
   * @param operand string inputs to the filter operation
   */
  public static notIn(...operand : string[]) : InsightsRuleBodyFilterOperationAndInput {
    this.validateTextOperation(InsightsRuleBodyFilterOperations.NOT_IN, operand);
    return {
      [InsightsRuleBodyFilterOperations.NOT_IN]: operand,
    };
  }

  /**
   * Creates a "StartsWith" filter operation JSON for Insights Rule Bodies
   *
   * For example, StartsWith('a', 'b') produces {"StartsWith" : ["a", "b"]}
   * @param operand string inputs to the filter operation
   */
  public static startsWith(...operand : string[]) : InsightsRuleBodyFilterOperationAndInput {
    this.validateTextOperation(InsightsRuleBodyFilterOperations.STARTS_WITH, operand);
    return {
      [InsightsRuleBodyFilterOperations.STARTS_WITH]: operand,
    };
  }

  /**
   * Creates a "GreaterThan" filter operation JSON for Insights Rule Bodies
   *
   * For example, greaterThan(0) produces {"GreaterThan" : 0}
   * @param operand numerical input to the filter operation
   */
  public static greaterThan(operand : number) : InsightsRuleBodyFilterOperationAndInput {
    return {
      [InsightsRuleBodyFilterOperations.GREATER_THAN]: operand,
    };
  }

  /**
   * Creates a "LessThan" filter operation JSON for Insights Rule Bodies
   *
   * For example, lessThan(10) produces {"LessThan" : 10}
   * @param operand numerical input to the filter operation
   */
  public static lessThan(operand : number) : InsightsRuleBodyFilterOperationAndInput {
    return {
      [InsightsRuleBodyFilterOperations.LESS_THAN]: operand,
    };
  }

  /**
   * Creates an "EqualTo" filter operation JSON for Insights Rule Bodies
   *
   * For example, equalTo(2) produces {"EqualTo" : 2}
   * @param operand numerical input to the filter operation
   */
  public static equalTo(operand : number) : InsightsRuleBodyFilterOperationAndInput {
    return {
      [InsightsRuleBodyFilterOperations.EQUAL_TO]: operand,
    };
  }

  /**
   * Creates a "NotEqualTo" filter operation JSON for Insights Rule Bodies
   *
   * For example, notEqualTo(9001) produces {"NotEqualTo" : 9001}
   * @param operand numerical input to the filter operation
   */
  public static notEqualTo(operand : number) : InsightsRuleBodyFilterOperationAndInput {
    return {
      [InsightsRuleBodyFilterOperations.NOT_EQUAL_TO]: operand,
    };
  }

  /**
   * Creates an "IsPresent" filter operation JSON for Insights Rule Bodies
   *
   * For example, isPresent(true) produces {"IsPresent" : true}
   * @param operand inputs to the filter operation
   */
  public static isPresent(operand: boolean) : InsightsRuleBodyFilterOperationAndInput {
    return {
      [InsightsRuleBodyFilterOperations.IS_PRESENT]: operand,
    };
  }

  private static MIN_TEXT_OPERANDS = 1;
  private static MAX_TEXT_OPERANDS = 10;

  /**
   * Validation function for text operation operands to confirm the correct number of parameters were given
   * @param operation the filter operation
   * @param operand the filter operand we are validating
   * @private
   */
  private static validateTextOperation(operation: InsightsRuleBodyFilterOperations, operand: string[]) {
    if (operand.length > this.MAX_TEXT_OPERANDS || operand.length < this.MIN_TEXT_OPERANDS) {
      throw new Error(`The ${operation} filter operation allows ${this.MIN_TEXT_OPERANDS} to ${this.MAX_TEXT_OPERANDS} `+
          `inputs, but ${operand.length} was provided`);
    }
  }
}

/**
 * A public API to use the filter operation functions to add filter operations to a filter.
 *
 * They are entirely the same as the base class, so nothing is added.
 */
export class CloudWatchLogsV1FilterOperationFunctions extends InsightsRuleBodyFilterOperationFunctions {
}

/**
 * One day the import classes may have something in common, so this is a parent class that will define those
 * common attributes and/or methods
 */
class InsightsRuleBodyFilter {
}

/**
 * Class that provides static APIs to add filters to a cloudwatch log v1 rule body
 */
export class CloudWatchLogsV1Filter extends InsightsRuleBodyFilter {

  /**
   * Converts an ICloudWatchLogV1RuleBodyFilter to filter JSON to be used in a rule body
   * @param filter the filter interface one wishes to use in a rule body
   */
  public static fromFilter(filter: ICloudWatchLogV1RuleBodyFilter): any {
    /**
     *  InsightsRuleBodyFilterOperationAndInput is defined such that it can only have 1 key and 1 value. Furthermore,
     *  since it is a "type" the user cannot add more fields to it, so assuming the operation and operand
     *  are at index 0 are fine
     */
    return {
      Match: filter.match,
      [Object.keys(filter.operationAndInput)[0]]: Object.values(filter.operationAndInput)[0],
    };
  }

  /**
   * Converts multiple filters (either given in JSON or in interface form) to filter JSON to be used in a rule body
   * @param filters the filter interfaces and/or filter JSON one wished to use in a rule body
   */
  public static allOf(...filters: ICloudWatchLogV1RuleBodyFilter[]): any[] {
    return filters.map(filter => this.fromFilter(filter));
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
   * Also, this is not camelcase, as 'valueOf?' for some reasons gives a compiler error that I cannot find online. May be
   * a typescript keyword
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
interface IInsightsRuleBody {
  /**
   * Defines the name and version of the rule body schema
   *
   * All rule bodies must provide a default for this. For example, in version 1 CloudWatch logs rule bodes
   * this defaults to { Name: "CloudWatchLogs", Version: 1}
   * @default - whatever is provided by the rule body importation class
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
   * NOTE: This ideally would include LogGroup constructs; however, this requires us to include the
   * aws-logs package, which includes the aws-cloudwatch package, which causes a dependecy cycle.
   */
  logGroupNames: string[],

  /**
   * Defines the format of the log group data
   *
   * @default - JSON if Fields undefined, else CLF
   */
  logFormat?: InsightsRuleLogFormats,

  /**
   * Defines the aliases for log keys for CLF formatted log groups
   *
   * @default - none, if the format is CLF there will be no aliases available for one's keys if CLF
   *  else, if JSON format, this has no effect.
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
      this.allKeysToPascalCase(dropUndefined(ruleBody)),
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
    /**
     * This has two possibilities of failures:
     * 1) From JSON.parse(...): The string provided is not valid JSON. If this passes, it's valid JSON
     * 2) From "ruleBody : ICloudWatchLogsV1RuleBody": The JSON object cannot be cast into a version 1 CW log rule body
     * If the above passes, it has all the correct and needed fields.
     *
     * See the note about about inquiring on try/catch to provide better error messages
     */
    let ruleBody : ICloudWatchLogsV1RuleBody = JSON.parse(ruleBodyString);

    ruleBody = this.setRuleBodyDefaults(ruleBody);
    this.validateRuleBody(ruleBody);
    return JSON.stringify(this.allKeysToPascalCase(ruleBody));
  }

  private static readonly MAX_KEYS: number = 4;
  private static readonly MIN_KEYS: number = 0;
  private static readonly SCHEMA: IInsightsRuleSchema = { name: 'CloudWatchLogRule', version: 1 };
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

    /**
     * Cloudformation will scream if we do not include an empty [] for filters if there are none
     */
    ruleBody.contribution.filters = ruleBody.contribution.filters || [];

    return ruleBody;
  }

  /**
   * Makes all the keys of a version 1 CloudWatch rule body PascalCase
   *
   * Doing this manually and non-generically was chosen, as a generic version would involve recursion
   * which isn't good for production.
   * @param ruleBody rule body that will have pascal case keys
   * @private
   */
  private static allKeysToPascalCase(ruleBody: ICloudWatchLogsV1RuleBody): any {
    return {
      Schema: {
        Name: ruleBody.schema?.name,
        Version: ruleBody.schema?.version,
      },
      LogGroupNames: ruleBody.logGroupNames,
      LogFormat: ruleBody.logFormat,
      Fields: ruleBody.fields,
      Contribution: {
        Keys: ruleBody.contribution.keys,
        ValueOf: ruleBody.contribution.valueof,
        Filters: ruleBody.contribution.filters,
      },
      AggregateOn: ruleBody.aggregateOn,
    };
  }
}
