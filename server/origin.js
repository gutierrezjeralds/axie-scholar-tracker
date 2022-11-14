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

// Export the function
module.exports = {
    authLogin,
    generateAccessToken,
    inGameSLP
};