import { readFileSync } from 'fs';
import { keysToPascalCase } from './private/insight-rule-util';
import { dropUndefined } from './private/object';

/**
 * All possible filter operations
 */
enum InsightRuleBodyFilterOperations {

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
 * Defines the filter operation and input for an Insight Rule Body
 *
 * In every filter, there is a line that defines the operation and input like "In" : ['this', 'that', 'there'],
 * where "In" is the operation and "['this', 'that', 'there']" is the operand.
 *
 * This type provides a convinient way of enforcing the operation for users creating filters
 */
export type InsightRuleBodyFilterOperationAndInput = {
  [operation : string]: string[] | number | boolean;
}

/**
 * Properties of an Insight Rule Filter, not exported as it is a base interface for other schema filter interfaces to inherit
 */
interface IInsightRuleBodyFilter {

  /**
     * Field of the log data the filter will act upon
     */
  match: string,

  /**
     * Filter operation chosen from InsightRuleBodyFilterOperations
     */
  operationAndInput: InsightRuleBodyFilterOperationAndInput
}

/**
 * Properties of a version 1 CloudWatchLogs Rule Body filter. It's the same as the base filter interface.
 * Added for future flexibility and inheritance purposes
 */
export interface ICloudWatchLogV1RuleBodyFilter extends IInsightRuleBodyFilter{
}

/**
 * A base class that defines the common filter operations for all schemas
 */
class InsightRuleBodyFilterOperationFunctions {

  /**
   * Creates an "In" filter operation JSON for Insight Rule Bodies
   *
   * For example, in('here', 'orThere') produces {"In" : ["here", "orThere"]}
   * @param operand string inputs to the filter operation
   */
  public static in(...operand : string[]) : InsightRuleBodyFilterOperationAndInput {
    this.validateTextOperation(InsightRuleBodyFilterOperations.IN, operand);
    return {
      [InsightRuleBodyFilterOperations.IN]: operand,
    };
  }

  /**
   * Creates a "NotIn" filter operation JSON for Insight Rule Bodies
   *
   * For example, NotIn('here', 'orThere') produces {"NotIn" : ["here", "orThere"]}
   * @param operand string inputs to the filter operation
   */
  public static notIn(...operand : string[]) : InsightRuleBodyFilterOperationAndInput {
    this.validateTextOperation(InsightRuleBodyFilterOperations.NOT_IN, operand);
    return {
      [InsightRuleBodyFilterOperations.NOT_IN]: operand,
    };
  }

  /**
   * Creates a "StartsWith" filter operation JSON for Insight Rule Bodies
   *
   * For example, StartsWith('a', 'b') produces {"StartsWith" : ["a", "b"]}
   * @param operand string inputs to the filter operation
   */
  public static startsWith(...operand : string[]) : InsightRuleBodyFilterOperationAndInput {
    this.validateTextOperation(InsightRuleBodyFilterOperations.STARTS_WITH, operand);
    return {
      [InsightRuleBodyFilterOperations.STARTS_WITH]: operand,
    };
  }

  /**
   * Creates a "GreaterThan" filter operation JSON for Insight Rule Bodies
   *
   * For example, greaterThan(0) produces {"GreaterThan" : 0}
   * @param operand numerical input to the filter operation
   */
  public static greaterThan(operand : number) : InsightRuleBodyFilterOperationAndInput {
    return {
      [InsightRuleBodyFilterOperations.GREATER_THAN]: operand,
    };
  }

  /**
   * Creates a "LessThan" filter operation JSON for Insight Rule Bodies
   *
   * For example, lessThan(10) produces {"LessThan" : 10}
   * @param operand numerical input to the filter operation
   */
  public static lessThan(operand : number) : InsightRuleBodyFilterOperationAndInput {
    return {
      [InsightRuleBodyFilterOperations.LESS_THAN]: operand,
    };
  }

  /**
   * Creates an "EqualTo" filter operation JSON for Insight Rule Bodies
   *
   * For example, equalTo(2) produces {"EqualTo" : 2}
   * @param operand numerical input to the filter operation
   */
  public static equalTo(operand : number) : InsightRuleBodyFilterOperationAndInput {
    return {
      [InsightRuleBodyFilterOperations.EQUAL_TO]: operand,
    };
  }

  /**
   * Creates a "NotEqualTo" filter operation JSON for Insight Rule Bodies
   *
   * For example, notEqualTo(9001) produces {"NotEqualTo" : 9001}
   * @param operand numerical input to the filter operation
   */
  public static notEqualTo(operand : number) : InsightRuleBodyFilterOperationAndInput {
    return {
      [InsightRuleBodyFilterOperations.NOT_EQUAL_TO]: operand,
    };
  }

  /**
   * Creates an "IsPresent" filter operation JSON for Insight Rule Bodies
   *
   * For example, isPresent(true) produces {"IsPresent" : true}
   * @param operand inputs to the filter operation
   */
  public static isPresent(operand: boolean) : InsightRuleBodyFilterOperationAndInput {
    return {
      [InsightRuleBodyFilterOperations.IS_PRESENT]: operand,
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
  private static validateTextOperation(operation: InsightRuleBodyFilterOperations, operand: string[]) {
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
export class CloudWatchLogsV1FilterOperationFunctions extends InsightRuleBodyFilterOperationFunctions {
}

/**
 * One day the import classes may have something in common, so this is a parent class that will define those
 * common attributes and/or methods
 */
class InsightRuleBodyFilter {
}

/**
 * Class that provides static APIs to add filters to a cloudwatch log v1 rule body
 */
export class CloudWatchLogsV1Filter extends InsightRuleBodyFilter {

  /**
   * Converts an ICloudWatchLogV1RuleBodyFilter to filter JSON to be used in a rule body
   * @param filter the filter interface one wishes to use in a rule body
   */
  public static fromFilter(filter: ICloudWatchLogV1RuleBodyFilter): any {
    /**
     *  InsightRuleBodyFilterOperationAndInput is defined such that it can only have 1 key and 1 value. Furthermore,
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
 * Properties of an Insight Rule Contribution
 */
export interface IInsightRuleContribution {
  /**
   * Array up to four log fields that are used as dimensions to classify contributors
   */
  keys: string[],

  /**
   * Specify this only when specifying SUM as AggregateOn and for log fields with numerical values. Used to sort
   * contributors by the sum of the values of their fields in valueOf
   *
   * Also, this is not camelcase, as 'valueOf' is a typescript keyword and if we leave it as such it'll give an error
   *
   * @default - none, no contributor sorting will occur
   */
  valueof?: string,

  /**
   * Array up to four filters to narrow the log events that are included in the report
   * If multiple are provided, Contributor Insight evaluates them with a logical AND operator
   *
   * @default - none, no narrowing of log events
   */
  filters?: any[]
}

/**
 * Properties of an Insight Rule Schema
 */
export interface IInsightRuleSchema {
  /**
   * Insight Rule Body schema name
   */
  name: string,

  /**
   * Insight Rule Body schema version
   */
  version: number
}

/**
 * An enum that describes the possible values for AggregateOn field in an Insight Rule Body
 */
export enum InsightRuleAggregates {
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
export enum InsightRuleLogFormats {
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
 * Common properties to all Insight Rule Bodies (besides string rule bodies)
 */
interface IInsightRuleBody {
  /**
   * Defines the name and version of the rule body schema
   *
   * All rule bodies must provide a default for this. For example, in version 1 CloudWatch logs rule bodes
   * this defaults to { Name: "CloudWatchLogs", Version: 1}
   * @default - whatever is provided by the rule body importation class
   */
  schema?: IInsightRuleSchema,

  /**
   * Defines all properties of the contribution for the rule body
   */
  contribution: IInsightRuleContribution,

  /**
   * Defines how the rule will aggregate the data for the report
   */
  aggregateOn?: InsightRuleAggregates
}

/**
 * Properties of a version 1 CloudWatch Logs rule body
 */
export interface ICloudWatchLogsV1RuleBody extends IInsightRuleBody{

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
  logFormat?: InsightRuleLogFormats,

  /**
   * Defines the aliases for log keys for CLF formatted log groups
   *
   * @default - none, if the format is CLF there will be no aliases available for one's keys if CLF
   *  else, if JSON format, this has no effect.
   */
  fields?: {[index: string] : string}
}

/**
 * Interface for describing a rule body
 */
export interface IRuleBody {

  /**
   * serialized representation of a rule body to be used when building the Insight Rule resource.
   */
  renderRuleBody(): string;
}

/**
 * Defines all attributes common to all rule body importation classes, besides CustomRuleBody
 */
class InsightRuleBody {
  protected static readonly MAX_CONTRIBUTION_KEYS : number = 4;
  protected static readonly MIN_CONTRIBUTION_KEYS : number = 0;
  protected static readonly MAX_CONTRIBUTION_FILTERS : number = 4;
}

/**
 * Class that defines the static import methods for a version 1 CloudWatch Logs rule body
 */
export class CloudWatchLogsV1RuleBody extends InsightRuleBody {

  /**
   * Creates a version 1 CloudWatch logs rule body from an ICloudWatchLogsV1RuleBody interface
   * @param ruleBody interface that describes the rule body
   */
  public static fromRuleBody(ruleBody: ICloudWatchLogsV1RuleBody): IRuleBody {
    ruleBody = this.setRuleBodyDefaults(ruleBody);
    this.validateRuleBody(ruleBody);

    return new class implements IRuleBody {
      public renderRuleBody(): string {
        return JSON.stringify(ruleBodyKeysToPascalCase(dropUndefined(ruleBody)));
      }
    };
  }

  /**
   * Creates a version 1 CloudWatch logs rule body from contents stored in a file
   * @param filepath location of file with a version 1 CloudWatch logs rule body
   * @param encoding encoding of file
   */
  public static fromFile(filepath: string, encoding : BufferEncoding = 'utf8'): IRuleBody {
    //If this fails, there is no better error message we can give, so allow it to not be caught
    let ruleBodyString : string = readFileSync(filepath, { encoding: encoding, flag: 'r' }).toString();

    /**
     * This has two possibilities of failures:
     * 1) From JSON.parse(...): The string provided is not valid JSON. If this passes, it's valid JSON
     * 2) From "ruleBody : ICloudWatchLogsV1RuleBody": The JSON object cannot be cast into a version 1 CW log rule body
     * If the above passes, it has all the correct and needed fields.
     *
     */
    let ruleBody : ICloudWatchLogsV1RuleBody = JSON.parse(ruleBodyString);

    return this.fromRuleBody(ruleBody);
  }

  private static readonly SCHEMA: IInsightRuleSchema = { name: 'CloudWatchLogRule', version: 1 };

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
    if (ruleBody.contribution.keys.length > this.MAX_CONTRIBUTION_KEYS ||
          ruleBody.contribution.keys.length < this.MIN_CONTRIBUTION_KEYS) {
      throw new Error(`A version 1 CloudWatch Log Rule body can have between ${this.MIN_CONTRIBUTION_KEYS} to `+`
           ${this.MIN_CONTRIBUTION_KEYS} keys, but ${ruleBody.contribution.keys.length} was given.`);
    }

    //validating the rule body for proper amount of filters, if given
    if (ruleBody.contribution.filters && ruleBody.contribution.filters.length > this.MAX_CONTRIBUTION_FILTERS) {
      throw new Error(`A version 1 CloudWatch Log Rule body can up to ${this.MAX_CONTRIBUTION_FILTERS} , but `+
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
    ruleBody.logFormat = ruleBody.logFormat || (ruleBody.fields? InsightRuleLogFormats.CLF : InsightRuleLogFormats.JSON);

    /**
     * If a schema is given, even if it is wrong (it'll be caught in validateRuleBody), it will be used.
     * Otherwise, this rule body's schema will be given.
     */
    ruleBody.schema = ruleBody.schema || this.SCHEMA;

    /**
     * For aggregate on, if a value is given.
     * Otherwise, if a value if NOT given, if valueOf is defined, SUM will be chosen (as the valueOf parameter only makes
     * sense to set it SUM is chosen for AggregateOn). Otherwise, COUNT is chosen.
     */
    ruleBody.aggregateOn = ruleBody.aggregateOn ||
        (ruleBody.contribution.valueof ? InsightRuleAggregates.SUM : InsightRuleAggregates.COUNT);

    /**
     * Cloudformation will scream if we do not include an empty [] for filters if there are none
     */
    ruleBody.contribution.filters = ruleBody.contribution.filters || [];

    return ruleBody;
  }
}

/**
 * Class that defines the static importation methods for a custom rule body
 *
 * This class, differing from all other rule body classes, does not perform any validation.
 */
export class CustomRuleBody {

  /**
   * Renders a rule body JSON to a string
   * @param ruleBody JSON describing a rule body
   */
  public static fromRuleBody(ruleBody: any): IRuleBody {
    return new class implements IRuleBody {
      public renderRuleBody(): string {
        return JSON.stringify(ruleBody);
      }
    };
  }

  /**
   * Creates a rule body from contents stored in a file
   * @param filepath location of file with a rule body
   * @param encoding encoding of file
   */
  public static fromFile(filepath: string, encoding : BufferEncoding = 'utf8'): IRuleBody {
    //If this fails, there is no better error message we can give, so allow it to not be caught
    return this.fromRuleBody(readFileSync(filepath, { encoding: encoding, flag: 'r' }).toString());
  }
}

export function ruleBodyKeysToPascalCase<T extends IInsightRuleBody>(ruleBody: T) {
  let pascalRuleBody : any = keysToPascalCase(ruleBody);

  //All fields should be good now besides the 'valueof' field which is now 'Valueof'. It needs to be 'ValueOf'
  //see note about ValueOf field in IInsightRuleContribution interface to explain why naming was chosen
  if (pascalRuleBody.Contribution.Valueof) {
    pascalRuleBody.Contribution.ValueOf = pascalRuleBody.Contribution.Valueof;
    delete pascalRuleBody.Contribution.Valueof;
  }

  return pascalRuleBody;
}