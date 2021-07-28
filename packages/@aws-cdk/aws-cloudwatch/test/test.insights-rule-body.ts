import { Test } from 'nodeunit';
import {
  CloudWatchLogsV1Filter,
  CloudWatchLogsV1FilterOperationFunctions, CloudWatchLogsV1RuleBody,
} from '../lib';

//for filters
const basicTextFilter = { Match: '$.httpMethod', In: ['PUT'] };
const basicNumericalFilter = { Match: '$.BytesRecieved', GreaterThan: 0 };


export = {

  /** Testing filters **/


  'In Insights-Rule-Body, basic text filter DOES NOT pass using filter builder when input is over max length '(test: Test) {

    test.throws(() => {
      CloudWatchLogsV1Filter.fromFilter(
        {
          match: 'anything',
          operationAndInput: CloudWatchLogsV1FilterOperationFunctions
            .in('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'),
        });
    },
    );

    test.done();
  },

  'In Insights-Rule-Body, basic text filter DOES NOT pass using filter interface when input is empty array '(test: Test) {

    test.throws(() => {
      CloudWatchLogsV1Filter.fromFilter(
        {
          match: 'anything',
          operationAndInput: CloudWatchLogsV1FilterOperationFunctions
            .in(),
        });
    },
    );

    test.done();
  },

  'In Insights-Rule-Body, basic text filter passes using filter interface'(test: Test) {

    test.equal(JSON.stringify(
      CloudWatchLogsV1Filter.fromFilter({
        match: '$.httpMethod',
        operationAndInput: {
          In: ['PUT'],
        },
      })),
    //expected
    JSON.stringify(basicTextFilter));

    test.done();
  },


  'In Insights-Rule-Body, basic numerical filter passes using filter interface'(test: Test) {

    test.equal(JSON.stringify(
      CloudWatchLogsV1Filter.fromFilter({
        match: '$.BytesRecieved',
        operationAndInput: {
          GreaterThan: 0,
        },
      })),
    //expected
    JSON.stringify(basicNumericalFilter));

    test.done();
  },

  'In Insights-Rule-Body, basic text filter passes using operation methods'(test: Test) {

    test.equal(JSON.stringify(
      CloudWatchLogsV1Filter.fromFilter({
        match: '$.httpMethod',
        operationAndInput: CloudWatchLogsV1FilterOperationFunctions.in('PUT'),
      }),
    ),
    //expected
    JSON.stringify(basicTextFilter));

    test.done();
  },

  'In Insights-Rule-Body, basic numerical filter passes using filter builder'(test: Test) {

    test.equal(JSON.stringify(
      CloudWatchLogsV1Filter.fromFilter({
        match: '$.BytesRecieved',
        operationAndInput: CloudWatchLogsV1FilterOperationFunctions.greaterThan(0),
      }),
    ),
    //expected
    JSON.stringify(basicNumericalFilter));

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
        logGroupNames: ['loggy'],
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
        logGroupNames: ['loggy'],
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
        logGroupNames: ['loggy'],
        contribution: {
          keys: ['the key!'],
          filters: CloudWatchLogsV1Filter.allOf(
            {
              match: 'asd',
              operationAndInput: CloudWatchLogsV1FilterOperationFunctions.startsWith('me'),
            },
            {
              match: 'asd',
              operationAndInput: CloudWatchLogsV1FilterOperationFunctions.startsWith('me'),
            },
            {
              match: 'asd',
              operationAndInput: CloudWatchLogsV1FilterOperationFunctions.startsWith('me'),
            },
            {
              match: 'asd',
              operationAndInput: CloudWatchLogsV1FilterOperationFunctions.startsWith('me'),
            },
            {
              match: 'asd',
              operationAndInput: CloudWatchLogsV1FilterOperationFunctions.startsWith('me'),
            },
          ),
        },
      });
    });

    test.done();
  },

  'In Insights-Rule-Body, basic version 1 CloudWatch log rule. Testing for schema and format defaults'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroupNames: ['loggy'],
      contribution: {
        keys: ['the key!'],
      },
    }));

    let expectedRuleBody = {
      Schema: {
        Name: 'CloudWatchLogRule',
        Version: 1,
      },
      LogGroupNames: ['loggy'],
      LogFormat: 'JSON',
      Contribution: {
        Keys: ['the key!'],
        Filters: [],
      },
      AggregateOn: 'Count',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, basic version 1 CloudWatch log rule with CLF. Testing for schema and format defaults'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroupNames: ['loggy'],
      fields: {
        1: 'bytes',
      },
      contribution: {
        keys: ['the key!'],
      },
    }));

    let expectedRuleBody = {
      Schema: {
        Name: 'CloudWatchLogRule',
        Version: 1,
      },
      Fields: {
        1: 'bytes',
      },
      LogGroupNames: ['loggy'],
      LogFormat: 'CLF',
      Contribution: {
        Keys: ['the key!'],
        Filters: [],
      },
      AggregateOn: 'Count',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, testing that SUM is inferred from defined valueOf field'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroupNames: ['loggy'],
      contribution: {
        keys: ['the key!'],
        valueof: 'fails',
      },
    }));

    let expectedRuleBody = {
      Schema: {
        Name: 'CloudWatchLogRule',
        Version: 1,
      },
      LogGroupNames: ['loggy'],
      LogFormat: 'JSON',
      Contribution: {
        Keys: ['the key!'],
        ValueOf: 'fails',
        Filters: [],
      },
      AggregateOn: 'Sum',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, Testing complex JSON rule'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      logGroupNames: ['loggy', 'loggy2', 'loggy3'],
      contribution: {
        keys: ['key1', 'key2', 'key3', 'key4'],
        valueof: 'fails',
        filters: CloudWatchLogsV1Filter.allOf(
          {
            match: '$.httpMethod',
            operationAndInput: CloudWatchLogsV1FilterOperationFunctions.in('PUT'),
          },
          {
            match: '$.BytesRecieved',
            operationAndInput: CloudWatchLogsV1FilterOperationFunctions.greaterThan(0),
          },
        ),
      },
    }));

    let expectedRuleBody = {
      Schema: {
        Name: 'CloudWatchLogRule',
        Version: 1,
      },
      LogGroupNames: ['loggy', 'loggy2', 'loggy3'],
      LogFormat: 'JSON',
      Contribution: {
        Keys: ['key1', 'key2', 'key3', 'key4'],
        ValueOf: 'fails',
        Filters: [
          { Match: '$.httpMethod', In: ['PUT'] },
          { Match: '$.BytesRecieved', GreaterThan: 0 },
        ],
      },
      AggregateOn: 'Sum',
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

  'In Insights-Rule-Body, testing integ rule'(test: Test) {

    let actualRuleBody = JSON.parse(CloudWatchLogsV1RuleBody.fromRuleBody({
      fields: { 1: 'requestId' },
      logGroupNames: ['/aws/lambda/*'],
      contribution: {
        keys: ['requestId'],
      },
    }));

    let expectedRuleBody = {
      Schema: {
        Name: 'CloudWatchLogRule',
        Version: 1,
      },
      AggregateOn: 'Count',
      Contribution: {
        Keys: [
          'requestId',
        ],
        Filters: [],
      },
      LogFormat: 'CLF',
      LogGroupNames: [
        '/aws/lambda/*',
      ],
      Fields: {
        1: 'requestId',
      },
    };
    test.deepEqual(actualRuleBody, expectedRuleBody);

    test.done();
  },

}