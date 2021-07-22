import { Test } from 'nodeunit';
import {
  CloudWatchLogsV1RuleBody,
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

  /** Testing filters **/

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

  /** Testing CloudWatchV1LogRuleBodys **/
  'In Insights-Rule-Body, throws if bad schema for CloudWatchLogs version 1 rule body'(test: Test) {

    test.throws(() => {
      CloudWatchLogsV1RuleBody.fromRuleBody({
        schema: {
          name: 'A very bad schema',
          version: -1,
        },
        logGroups: ['loggy'],
        contribution: {
          keys: ['1', '2', '3', '4', 'OH_NO!'],
        },
      });
    });

    test.done();
  },

  'In Insights-Rule-Body, throws if too many keys for CloudWatchLogs version 1 rule body'(test: Test) {

    test.throws(() => {
      CloudWatchLogsV1RuleBody.fromRuleBody({
        logGroups: ['loggy'],
        contribution: {
          keys: ['1', '2', '3', '4', 'OH_NO!'],
        },
      });
    });

    test.done();
  },

  'In Insights-Rule-Body, throws if too many filters for CloudWatchLogs version 1 rule body'(test: Test) {

    test.throws(() => {
      CloudWatchLogsV1RuleBody.fromRuleBody({
        logGroups: ['loggy'],
        contribution: {
          keys: ['the key!'],
          filters: [
            InsightsRuleBodyFilter.fromFilter(
              new InsightsRuleBodyFilterBuilder('1').greaterThan(0).toFilter(),
            ),
            InsightsRuleBodyFilter.fromFilter(
              new InsightsRuleBodyFilterBuilder('2').greaterThan(0).toFilter(),
            ),
            InsightsRuleBodyFilter.fromFilter(
              new InsightsRuleBodyFilterBuilder('3').greaterThan(0).toFilter(),
            ),
            InsightsRuleBodyFilter.fromFilter(
              new InsightsRuleBodyFilterBuilder('4').greaterThan(0).toFilter(),
            ),
            InsightsRuleBodyFilter.fromFilter(
              new InsightsRuleBodyFilterBuilder('5').greaterThan(0).toFilter(),
            ),
          ],
        },
      });
    });

    test.done();
  },

  'In Insights-Rule-Body, basic version 1 CloudWatch log rule. Testing for schema and format defaults'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroups: ['loggy'],
      contribution: {
        keys: ['the key!'],
      },
    }));

    let expectedRuleBody = {
      schema: {
        name: 'CloudWatchLogs',
        version: 1,
      },
      logGroups: ['loggy'],
      logFormat: 'JSON',
      contribution: {
        keys: ['the key!'],
      },
      aggregateOn: 'Count',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, basic version 1 CloudWatch log rule with CLF. Testing for schema and format defaults'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroups: ['loggy'],
      fields: {
        1: 'bytes',
      },
      contribution: {
        keys: ['the key!'],
      },
    }));

    let expectedRuleBody = {
      schema: {
        name: 'CloudWatchLogs',
        version: 1,
      },
      fields: {
        1: 'bytes',
      },
      logGroups: ['loggy'],
      logFormat: 'CLF',
      contribution: {
        keys: ['the key!'],
      },
      aggregateOn: 'Count',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, testing that SUM is inferred from defined valueOf field'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroups: ['loggy'],
      contribution: {
        keys: ['the key!'],
        valueof: 'fails',
      },
    }));

    let expectedRuleBody = {
      schema: {
        name: 'CloudWatchLogs',
        version: 1,
      },
      logGroups: ['loggy'],
      logFormat: 'JSON',
      contribution: {
        keys: ['the key!'],
        valueof: 'fails',
      },
      aggregateOn: 'Sum',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, Testing complex JSON rule'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroups: ['loggy', 'loggy2', 'loggy3'],
      contribution: {
        keys: ['key1', 'key2', 'key3', 'key4'],
        valueof: 'fails',
        filters: [
          InsightsRuleBodyFilter.fromFilter(
            {
              filterMatch: '$.httpMethod',
              filterOperand: ['PUT'],
              filterOperation: InsightsRuleBodyFilterOperations.IN,
              filterIgnoreCase: true,
            },
          ),
          InsightsRuleBodyFilter.fromFilter(
            new InsightsRuleBodyFilterBuilder('$.BytesRecieved').greaterThan(0)
              .statistic(InsightsRuleBodyFilterStatistics.SUM),
          ),
        ],
      },
    }));

    let expectedRuleBody = {
      schema: {
        name: 'CloudWatchLogs',
        version: 1,
      },
      logGroups: ['loggy', 'loggy2', 'loggy3'],
      logFormat: 'JSON',
      contribution: {
        keys: ['key1', 'key2', 'key3', 'key4'],
        valueof: 'fails',
        filters: [
          { Match: '$.httpMethod', In: ['PUT'], IgnoreCase: true },
          { Match: '$.BytesRecieved', GreaterThan: 0, Statistic: 'Sum' },
        ],
      },
      aggregateOn: 'Sum',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

}