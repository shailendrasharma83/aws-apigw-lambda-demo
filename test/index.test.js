const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const ssmJson = require("../config/ssm.json")
AWSMock.setSDKInstance(AWS);
AWSMock.mock('SSM', 'getParameter', function (params, callback) {
    callback(null, {
        Parameter: {
            Name: 'rate-map',
            Value: JSON.stringify(ssmJson)
        }
    });
});

process.env.AWS_REGION = "anyRegion"

const assert = require('assert');
const handler = require('../index').handler;

const createMockRequest = (amt) => {
    const request = {
        queryStringParameters:
            {
                amount: amt
            }

    };
    return request;
};

describe('Rate function', () => {

    describe('when getting rate for a given amount', () => {

        it('Should throw bad request when amount is less then 0', async () => {
            let errorMessage = "INVALID_AMOUNT";
            const response = await handler(createMockRequest(-1));
            assert.equal(response.statusCode, 400)
            assert.equal(JSON.parse(response.body).message, errorMessage)
        })


        it('Should throw error when amount is 0', async () => {
            let errorMessage = "INVALID_AMOUNT";
            const response = await handler(createMockRequest(-1));
            assert.equal(response.statusCode, 400)
            assert.equal(JSON.parse(response.body).message, errorMessage)
        })

        it('Should return rate as 1 when amount is less then 1000', async () => {
            let expectedRate = 1;
            const response = await handler(createMockRequest(10));
            assert.equal(response.statusCode, 200)
            assert.equal(JSON.parse(response.body).rate, expectedRate)
        })

        it('Should return rate as 1.5 when amount is between greater then 1000 and less then equal to 5000', async () => {
            let expectedRate = 1.5;
            const response = await handler(createMockRequest(1050));
            assert.equal(response.statusCode, 200)
            assert.equal(JSON.parse(response.body).rate, expectedRate)
        })

        it('Should return rate as 2 when amount is between greater then 5000 and less then equal to 10000', async () => {
            let expectedRate = 2;
            const response = await handler(createMockRequest(6000));
            assert.equal(response.statusCode, 200)
            assert.equal(JSON.parse(response.body).rate, expectedRate)
        })

        it('Should return rate as 2.5 when amount is between greater then 10000 and less then equal to 50000', async () => {
            let expectedRate = 2.5;
            const response = await handler(createMockRequest(16000));
            assert.equal(response.statusCode, 200)
            assert.equal(JSON.parse(response.body).rate, expectedRate)
        })

        it('Should return rate as 3 when amount is between greater then 50000', async () => {
            let expectedRate = 3;
            const response = await handler(createMockRequest(160000));
            assert.equal(response.statusCode, 200)
            assert.equal(JSON.parse(response.body).rate, expectedRate)
        })


        it('Should throw bad request when ssm call fails', async () => {
            AWSMock.restore(); // Undoing mock to throw actual exception
            const response = await handler(createMockRequest(100));
            assert.equal(response.statusCode, 500)
        })
    });
});

