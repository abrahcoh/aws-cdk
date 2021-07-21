import { Test } from 'nodeunit';
import {
  InsightsRuleBodyFilter,
  InsightsRuleBodyFilterBuilder,
  InsightsRuleBodyFilterOperations,
  InsightsRuleBodyFilterStatistics,
} from '../lib';

//for filters
const basicTextFilter = { Match: '$.httpMethod', In: ['PUT'] };
const basicTextFilterIgnoreCase = { Match: '$.httpMethod', In: ['PUT'], IgnoreCase: true };
const basicNumericalFilter = { Match: '$.BytesRecieved', GreaterThan: 0 };
const basicNumericalFilterAverage = { Match: '$.BytesRecieved', GreaterThan: 0, Statistic: 'Average' };


export = {

  'In Insights-Rule-Body, filter does not work without filterOperation method'(test: Test) {

    test.throws(() => {
      InsightsRuleBodyFilter.fromFilter(
        new InsightsRuleBodyFilterBuilder('$.httpMethod').toFilter());
    },
    );

    test.done();
  },

  'In Insights-Rule-Body, basic text filter DOES NOT pass using filter builder when input is over max length '(test: Test) {

    test.throws(() => {
      InsightsRuleBodyFilter.fromFilter(
        new InsightsRuleBodyFilterBuilder('$.httpMethod')
          .in(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']).toFilter());
    },
    );

    test.done();
  },

  'In Insights-Rule-Body, basic text filter DOES NOT pass using filter interface when input is empty array '(test: Test) {

    test.throws(() => {
      InsightsRuleBodyFilter.fromFilter(
        new InsightsRuleBodyFilterBuilder('$.httpMethod').in([]).toFilter());
    },
    );

    test.done();
  },

  'In Insights-Rule-Body, basic text filter passes using filter interface'(test: Test) {

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter({
        filterMatch: '$.httpMethod',
        filterOperation: InsightsRuleBodyFilterOperations.IN,
        filterOperand: ['PUT'],
      })),
    //expected
    JSON.stringify(basicTextFilter));

    test.done();
  },

  'In Insights-Rule-Body, basic text filter with ignore case passes using filter interface'(test: Test) {

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter({
        filterMatch: '$.httpMethod',
        filterOperation: InsightsRuleBodyFilterOperations.IN,
        filterOperand: ['PUT'],
        filterIgnoreCase: true,
      })),
    //expected
    JSON.stringify(basicTextFilterIgnoreCase));

    test.done();
  },

  'In Insights-Rule-Body, basic numerical filter passes using filter interface'(test: Test) {

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter({
        filterMatch: '$.BytesRecieved',
        filterOperation: InsightsRuleBodyFilterOperations.GREATER_THAN,
        filterOperand: 0,
      })),
    //expected
    JSON.stringify(basicNumericalFilter));

    test.done();
  },

  'In Insights-Rule-Body, basic numerical filter with statistic passes using filter interface'(test: Test) {

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter({
        filterMatch: '$.BytesRecieved',
        filterOperation: InsightsRuleBodyFilterOperations.GREATER_THAN,
        filterOperand: 0,
        filterStatistic: InsightsRuleBodyFilterStatistics.AVERAGE,
      })),
    //expected
    JSON.stringify(basicNumericalFilterAverage));

    test.done();
  },

  'In Insights-Rule-Body, basic text filter passes using filter builder'(test: Test) {

    let filter = new InsightsRuleBodyFilterBuilder('$.httpMethod').in(['PUT']).toFilter();

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter(filter),
    ),
    //expected
    JSON.stringify(basicTextFilter));

    test.done();
  },

  'In Insights-Rule-Body, basic text filter with ignore case passes using filter builder'(test: Test) {

    let filter = new InsightsRuleBodyFilterBuilder('$.httpMethod').in(['PUT']).ignoreCase(true).toFilter();

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter(filter),
    ),
    //expected
    JSON.stringify(basicTextFilterIgnoreCase));

    test.done();
  },

  'In Insights-Rule-Body, basic numerical filter passes using filter builder'(test: Test) {

    let filter = new InsightsRuleBodyFilterBuilder('$.BytesRecieved').greaterThan(0).toFilter();

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter(filter),
    ),
    //expected
    JSON.stringify(basicNumericalFilter));

    test.done();
  },

  'In Insights-Rule-Body, basic numerical filter passes with statistic using filter builder'(test: Test) {

    let filter = new InsightsRuleBodyFilterBuilder('$.BytesRecieved').greaterThan(0)
      .statistic(InsightsRuleBodyFilterStatistics.AVERAGE).toFilter();

    test.equal(JSON.stringify(
      InsightsRuleBodyFilter.fromFilter(filter),
    ),
    //expected
    JSON.stringify(basicNumericalFilterAverage));

    test.done();
  },

}