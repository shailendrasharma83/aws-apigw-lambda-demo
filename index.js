const AWS = require('aws-sdk')
const SSM = new AWS.SSM()

exports.handler = async function (event) {
    console.log("Hello From :: Version 3")
    console.log("Introducing Error 
                
    let map, amount;
    try {
        amount = event.queryStringParameters.amount

        if(amount<=0) {
            throw new BadRequestException("INVALID_AMOUNT")
        }

        const SSM_PARAMS = await SSM.getParameter({
            Name: "rate-map",
            WithDecryption: true
        }).promise()

        map = JSON.parse(SSM_PARAMS.Parameter.Value)

        return {
            statusCode: 200,
            body: JSON.stringify({"rate" : getApplicableRate(map.rates, amount)}),
        };
    }
    catch (err) {
        return {
            statusCode:  err instanceof BadRequestException ? 400 : 500,
            body: JSON.stringify({ message: err.message }),
        };
    }
}

function getApplicableRate(rates, amount) {
    return rates.reduce((prev, current) => current.min <= amount ? current : prev).rate
}

class BadRequestException extends Error {
    constructor(args){
        super(args);
    }
}
