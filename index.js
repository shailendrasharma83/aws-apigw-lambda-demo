const AWS = require('aws-sdk')
const SSM = new AWS.SSM()

exports.handler = async function (event) {
    let map, amount;
    try {
        amount = event.queryStringParameters.amount

        const SSM_PARAMS = await SSM.getParameter({
            Name: "rate-map",
            WithDecryption: true
        }).promise()

        map = JSON.parse(SSM_PARAMS.Parameter.Value)

        return {
            statusCode: 200,
            body: JSON.stringify({"rate" : getApplicableRate(map.rates, amount)}),
        };
    } catch (err) {
        console.log('Error Occurred ::' + err)
        return {
            statusCode: 500,
            body: JSON.stringify({ detail: err }),
        };
    }
}

function getApplicableRate(rates, amount) {
    return rates.reduce((prev, current) => current.min <= amount ? current : prev).rate
}
