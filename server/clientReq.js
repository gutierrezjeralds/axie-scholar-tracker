const request = require("request");
const Web3 = require("web3");

/*
    * Generate Access Token via GraphQl
    * * * https://github.com/LampAndMaxAxie/LampAndMaxAxieBot/blob/c023fb37da62ae583c4f8b78c7da8811048b001e/AccessToken.py
*/

// Auth Login
async function authLogin(credentials, logger, CONSTANTS) {
    return new Promise(async(resolve, reject) => {
        try {
            // Get Token from Auth Login
            logger(CONSTANTS.MESSAGE.STARTED_AUTHLOGIN);
            request.post(
                {
                    url:'https://athena.skymavis.com/v1/rpc/auth/login', 
                    json: credentials
                },
                function (err, httpResponse, body) {
                    if (err) {
                        logger(CONSTANTS.MESSAGE.ERROR_AUTHLOGIN);
                        reject({ error: true, data: err });
                    } else {
                        if (httpResponse.statusCode === 200) {
                            // Success return of Random Message
                            logger(CONSTANTS.MESSAGE.END_AUTHLOGIN);
                            resolve({ error: false, data: body });
                        } else {
                            // Has error in response
                            logger(CONSTANTS.MESSAGE.ERROR_AUTHLOGIN);
                            let errMsg = CONSTANTS.MESSAGE.ERROR_AUTHLOGIN;
                            try {
                                errMsg = httpResponse.body ? JSON.parse(httpResponse.body)._errorMessage : CONSTANTS.MESSAGE.ERROR_AUTHLOGIN;
                            } catch {
                                errMsg = CONSTANTS.MESSAGE.ERROR_AUTHLOGIN;
                            }
                            reject({ error: true, data: errMsg });
                        }
                    }
                }
            );
        } catch (error) {
            logger(CONSTANTS.MESSAGE.INTERNAL_SERVER_ERROR, error);
            reject({ error: true, data: error });
        }
    }).catch((err) => {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err);
		return err;
	});
}

// Generate Token
async function generateAccessToken(key, address, name, logger, CONSTANTS) {
    return new Promise(async(resolve, reject) => {
        try {
            // Get Random Message x Initial Process
            logger(CONSTANTS.MESSAGE.STARTED_GENERATE_RANDOMMSG);
            request.post(
                {
                    url:'https://graphql-gateway.axieinfinity.com/graphql',
                    json: {
                        "query": "mutation CreateRandomMessage{createRandomMessage}",
                        "variables": {}
                    }
                },
                async function (err, httpResponse, body) {
                    if (err) {
                        reject({ error: true, errorMsg: err });
                    } else {
                        if (httpResponse.statusCode === 200) {
                            // Success return of Random Message
                            try {
                                const result = body ? JSON.parse(body) : false;
                                if (result) {
                                    if (result.data !== null && result.data !== undefined && Object.keys(result.data).length > 0) {
                                        if (result.data.createRandomMessage !== undefined && result.data.createRandomMessage.length > 0) {
                                            // Return Success
                                            const msg = result.data.createRandomMessage;
                                            await signRoninMessage(msg, key, address, name, logger, CONSTANTS); // Run Sign Ronin Message
                                        } else {
                                            // Return error
                                            logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG);
                                            reject({ error: true, errorMsg: CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG });
                                        }
                                    } else {
                                        // Return error
                                        logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG);
                                        reject({ error: true, errorMsg: CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG });
                                    }
                                } else {
                                    // Has error in JSON Parsing
                                    logger(CONSTANTS.MESSAGE.ERROR_JSONPARSE);
                                    reject({ error: true, errorMsg: CONSTANTS.MESSAGE.ERROR_JSONPARSE });
                                }
                            } catch {
                                // Has error
                                logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG);
                                reject({ error: true, errorMsg: CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG });
                            }
                        } else {
                            // Has error in response
                            logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG);
                            let errMsg = CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG;
                            try {
                                errMsg = httpResponse.body ? JSON.parse(httpResponse.body)._errorMessage : CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG;
                            } catch {
                                errMsg = CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG;
                            }
                            reject({ error: true, errorMsg: errMsg });
                        }
                    }
                }
            );
        } catch (error) {
            logger(CONSTANTS.MESSAGE.INTERNAL_SERVER_ERROR, error);
            reject({ error: true, errorMsg: err });
        }
    }).catch((err) => {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err);
		return error;
	});
}

// Get Sign Ronin Message x Second Process
async function signRoninMessage(message, key, address, name, logger, CONSTANTS) {
    logger(CONSTANTS.MESSAGE.STARTED_GENERATE_SIGNRONINMSG);
    try {
        if (message !== undefined) {
            const ronweb3 = new Web3(new Web3.providers.HttpProvider('https://api.roninchain.com/rpc'));
            const sig = ronweb3.eth.accounts.sign(message, key);
            const signature = sig['signature'];
            await CreateAccessToken(message, signature, address, name); // Run Create Access Token
        } else {
            // Instant return error x no other transaction
            logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_SIGNRONINMSG);
            return {error: true};
        }
    } catch (err) {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
        return {error: true};
    }
}

// Create Access Token x Final Process
async function CreateAccessToken(message, signnature, address, name, logger, CONSTANTS) {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_CREATE_ACCESSMSG);
        request.post(
            {
                url:'https://graphql-gateway.axieinfinity.com/graphql',
                json: {
                    "query": "mutation CreateAccessTokenWithSignature($input:SignatureInput!){createAccessTokenWithSignature(input:$input){newAccount,result,accessToken,__typename}}",
                    "variables": {
                        "input": {
                            "mainnet": "ronin",
                            "owner": address,
                            "message": message,
                            "signature": signnature
                        }
                    }
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    reject({ error: true, errorMsg: err });
                } else {
                    if (httpResponse.statusCode === 200) {
                        // Success return of Random Message
                        try {
                            const result = body ? JSON.parse(body) : false;
                            if (result) {
                                if (result.data !== null && result.data !== undefined && Object.keys(result.data).length > 0) {
                                    if (result.data.createAccessTokenWithSignature !== undefined && Object.keys(result.data.createAccessTokenWithSignature).length > 0) {
                                        if (result.data.createAccessTokenWithSignature.accessToken !== undefined && result.data.createAccessTokenWithSignature.accessToken.length > 0) {
                                            // Return Success x Resolve final process
                                            const accessToken = result.data.createAccessTokenWithSignature.accessToken;
                                            return resolve({error: false, name: name, token: accessToken});
                                        } else {
                                            // Return error
                                            return reject({error: true, name: name});
                                        }
                                    } else {
                                        // Return error
                                        return reject({error: true, name: name});
                                    }
                                } else {
                                    // Return error
                                    return reject({error: true, name: name});
                                }
                            } else {
                                // Has error in JSON Parsing
                                logger(CONSTANTS.MESSAGE.ERROR_JSONPARSE);
                                reject({ error: true, errorMsg: CONSTANTS.MESSAGE.ERROR_JSONPARSE });
                            }
                        } catch {
                            // Has error
                            logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_RANDOMMSG);
                            reject({ error: true, errorMsg: CONSTANTS.MESSAGE.CANT_GEN_TOKEN_ACCESSMSG });
                        }
                    } else {
                        // Has error in response
                        logger(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_ACCESSMSG);
                        let errMsg = CONSTANTS.MESSAGE.CANT_GEN_TOKEN_ACCESSMSG;
                        try {
                            errMsg = httpResponse.body ? JSON.parse(httpResponse.body)._errorMessage : CONSTANTS.MESSAGE.CANT_GEN_TOKEN_ACCESSMSG;
                        } catch {
                            errMsg = CONSTANTS.MESSAGE.CANT_GEN_TOKEN_ACCESSMSG;
                        }
                        reject({ error: true, errorMsg: errMsg });
                    }
                }
            }
        );
    } catch (err) {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
        return reject({error: true});
    }
}

// Origin InGame SLP
async function inGameSLP(access, logger, CONSTANTS) {
    return new Promise(async(resolve, reject) => {
        try {
            // Get Token from Auth Login
            logger(CONSTANTS.MESSAGE.STARTED_INGAMESLP);
            request.get(
                {
                    url:'https://game-api-origin.skymavis.com/v2/users/me/items/marketplace/slp',
                    headers: {
                        'Authorization': 'Bearer ' + access.token
                    }
                },
                function (err, httpResponse, body) {
                    if (err) {
                        logger(CONSTANTS.MESSAGE.ERROR_INGAMESLP);
                        reject({ error: true, data: err });
                    } else {
                        if (httpResponse.statusCode === 200) {
                            // Success return of Random Message
                            logger(CONSTANTS.MESSAGE.END_INGAMESLP);
                            resolve({ error: false, data: body });
                        } else {
                            // Has error in response
                            logger(CONSTANTS.MESSAGE.ERROR_INGAMESLP);
                            let errMsg = CONSTANTS.MESSAGE.ERROR_INGAMESLP;
                            try {
                                errMsg = httpResponse.body ? JSON.parse(httpResponse.body)._errorMessage : CONSTANTS.MESSAGE.ERROR_INGAMESLP;
                            } catch {
                                errMsg = CONSTANTS.MESSAGE.ERROR_INGAMESLP;
                            }
                            reject({ error: true, data: errMsg });
                        }
                    }
                }
            );
        } catch (error) {
            logger(CONSTANTS.MESSAGE.INTERNAL_SERVER_ERROR, error);
            reject({ error: true, data: error });
        }
    }).catch((err) => {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err);
		return err;
	});
}

// Get SLP and AXS Crypto Currency
async function getCryptoCoins(logger, CONSTANTS) {
    return new Promise(async(resolve, reject) => {
        try {
            // Get Crypto Coins from Binance
            logger(CONSTANTS.MESSAGE.STARTED_CRYPTOCOINS);
            request.get(
                {
                    url:'https://api.binance.com/api/v3/ticker/price?symbols=["SLPUSDT","AXSUSDT"]'
                },
                async function (err, httpResponse, body) {
                    if (err) {
                        // Has Error x Get data from Alternative Crypto Coins API
                        const coingecko = await getCoingecko(logger, CONSTANTS);
                        resolve (coingecko);
                    } else {
                        if (httpResponse.statusCode === 200) {
                            // Success return
                            logger(CONSTANTS.MESSAGE.END_CRYPTOCOINS);

                            try {
                                const dataRes = body ? JSON.parse(body) : false;
                                if (dataRes) {
                                    let isSLPValue = 0, isAXSValue = 0;
                                    // Get the PHP Value
                                    const currencies = await getPHPCurrentValue(logger, CONSTANTS);
                                    const phpCurrency = !currencies.error ? JSON.parse(currencies.data).rates.PHP : 0; // 0 is default PHP Value
                                    console.log("phpCurrency", phpCurrency)

                                    // Map the Crypto Coins
                                    dataRes.map(items => {
                                        // Get SLP value in Binance result
                                        if (items.symbol === "SLPUSDT") {
                                            isSLPValue = Number(items.price) * Number(phpCurrency);
                                        }
                                        // Get AXS value in Binance result
                                        if (items.symbol === "AXSUSDT") {
                                            isAXSValue = Number(items.price) * Number(phpCurrency);
                                        }
                                        // Return
                                        return true;
                                    });
        
                                    resolve({ error: false, data: {
                                        NAME: CONSTANTS.MESSAGE.BINANCE,
                                        SLP: isSLPValue.toFixed(4),
                                        AXS: isAXSValue.toFixed(4),
                                        URI: "https://www.binance.com/en/trade/SLP_USDT"
                                    }});
                                } else {
                                    // Has Error x Get data from Alternative Crypto Coins API
                                    const coingecko = await getCoingecko(logger, CONSTANTS);
                                    resolve (coingecko);
                                }
                            } catch {
                                // Has Error x Get data from Alternative Crypto Coins API
                                const coingecko = await getCoingecko(logger, CONSTANTS);
                                resolve (coingecko);
                            }
                        } else {
                            // Has Error x Get data from Alternative Crypto Coins API
                            const coingecko = await getCoingecko(logger, CONSTANTS);
                            resolve (coingecko);
                        }
                    }
                }
            );
        } catch (error) {
            // Has Error x Get data from Alternative Crypto Coins API
            const coingecko = await getCoingecko(logger, CONSTANTS);
            resolve (coingecko);
        }
    }).catch((err) => {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err);
		return err;
	});
}

// Get Crypto Coins from Coingecko
async function getCoingecko(logger, CONSTANTS) {
    return new Promise(async(resolve, reject) => {
        try {
            // Get Crypto Coins from Binance
            logger(CONSTANTS.MESSAGE.STARTED_CRYPTOCOINS);
            request.get(
                {
                    url:'https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion,axie-infinity&vs_currencies=php'
                },
                async function (err, httpResponse, body) {
                    if (err) {
                        logger(CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS);
                        reject({ error: true, data: err });
                    } else {
                        if (httpResponse.statusCode === 200) {
                            // Success return
                            logger(CONSTANTS.MESSAGE.END_CRYPTOCOINS);

                            try {
                                const currencies = body ? JSON.parse(body) : false; // 0 is default PHP Value
                                if (currencies) {
                                    resolve({ error: false, data: {
                                        NAME: CONSTANTS.MESSAGE.COINGECKO,
                                        SLP: (currencies["smooth-love-potion"].php).toFixed(4),
                                        AXS: (currencies["axie-infinity"].php).toFixed(4),
                                        URI: "https://www.coingecko.com/en/coins/smooth-love-potion"
                                    }});
                                } else {
                                    reject({ error: true, data: CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS });
                                }
                            } catch {
                                reject({ error: true, data: CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS });
                            }
                        } else {
                            // Has error in response
                            logger(CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS);
                            let errMsg = CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS;
                            try {
                                errMsg = httpResponse.body ? JSON.parse(httpResponse.body)._errorMessage : CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS;
                            } catch {
                                errMsg = CONSTANTS.MESSAGE.ERROR_CRYPTOCOINS;
                            }
                            reject({ error: true, data: errMsg });
                        }
                    }
                }
            );
        } catch (error) {
            logger(CONSTANTS.MESSAGE.INTERNAL_SERVER_ERROR, error);
            reject({ error: true, data: error });
        }
    }).catch((err) => {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err);
		return err;
	});
}

// Get frankfurter data / json
async function getPHPCurrentValue(logger, CONSTANTS) {
    return new Promise((resolve, reject) => {
        // Get Current PHP Value
        request.get(
            {
                url:'https://api.frankfurter.app/latest?from=USD'
            },
            async function (err, httpResponse, body) {
                if (err) {
                    reject({ error: true, data: err });
                } else {
                    if (httpResponse.statusCode === 200) {
                        // Success return
                        return resolve({error: false, data: body});
                        
                    } else {
                        // Has error in response
                        return reject({error: true, data: error})
                    }
                }
            }
        )
    }).catch(err => {
        logger(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
        return err;
    });
}

// Export the function
module.exports = {
    authLogin,
    generateAccessToken,
    inGameSLP,
    getCryptoCoins
};