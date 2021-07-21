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
