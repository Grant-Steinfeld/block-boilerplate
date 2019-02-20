/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyContract extends Contract {

    async instantiate(ctx) {
        console.info('instantiate MyContract');
    }

    async makeMark(ctx, boardUUID, cells, state) {
        console.log("my-contract::makeMark")
        console.info(`boardUUID:${boardUUID} cells:${cells} state:${state}`)

        let boardState = {boardUUID:boardUUID, cells:cells, state:state}
        await ctx.stub.putState(boardUUID, Buffer.from(JSON.stringify(boardState)));
    }



    async query(ctx, key){
        console.info('query by key ' + key);
        let returnAsBytes = await ctx.stub.getState(key);
        console.info(returnAsBytes)
        if (!returnAsBytes || returnAsBytes.length === 0) {
          return new Error(`${key} does not exist`);
        }
        let result = JSON.parse(returnAsBytes);
        console.info('result of getState: ');
        console.info(result);
        return JSON.stringify(result);
      }

      
 /**
  * https://github.com/rojanjose/commpaper/blob/master/papercontract.js#L222
     * Query by Issuer
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
    */
   async queryAll(ctx) {

    let queryString = {
        "selector": {}
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

}

/**
 * Evaluate a queryString
 *
 * @param {Context} ctx the transaction context
 * @param {String} queryString the query string to be evaluated
*/    
async queryWithQueryString(ctx, queryString) {

    console.log("query String");
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    
    let allResults = [];

    while (true) {
        let res = await resultsIterator.next();

        if (res.value && res.value.value.toString()) {
            let jsonRes = {};

            console.log(res.value.value.toString('utf8'));

            jsonRes.Key = res.value.key;

            try {
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            } catch (err) {
                console.log(err);
                jsonRes.Record = res.value.value.toString('utf8');
            }

            allResults.push(jsonRes);
        }
        if (res.done) {
            console.log('end of data');
            await resultsIterator.close();
            console.info(allResults);
            console.log(JSON.stringify(allResults));
            return JSON.stringify(allResults);
        }
    }

}


}

module.exports = MyContract;
