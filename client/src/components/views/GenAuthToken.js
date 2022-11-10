// https://github.com/LampAndMaxAxie/LampAndMaxAxieBot/blob/c023fb37da62ae583c4f8b78c7da8811048b001e/AccessToken.py

// import React from 'react'
import Web3 from 'web3';
import $ from 'jquery';
import { CONSTANTS } from '../Constants';

export const AuthLogin = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("datas", data)
            $.ajax({
                url: "https://athena.skymavis.com/v1/rpc/auth/login",
                type: "POST",
                data: JSON.stringify(data),
                contentType: 'application/json',
                cache: false,
                crossDomain: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*',
                    'Access-Control-Allow-Credentials': true,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'X-Auth-Token'
                }
            })
            .then(
                (result) => {
                    console.log("result", result)
                    return resolve({error: false, result: result});
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    // Get Cookies data based on eth address
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true});
                }
            )
            .catch(
                (err) => {
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true});
                }
            )
        } catch (err) {
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            return reject({error: true});
        }
    }).catch(err => {
        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
        return err;
    });
};

export const GenerateAccessToken = async (key, address, name) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get Random Message x Initial Process
            $.ajax({
                url: "https://graphql-gateway.axieinfinity.com/graphql",
                type: "POST",
                data: JSON.stringify({
                    "query": "mutation CreateRandomMessage{createRandomMessage}",
                    "variables": {}
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Origin': 'http://team-loki.herokuapp.com',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                cache: false
            })
            .then(
                async (result) => {
                    if (result.data !== null && result.data !== undefined && Object.keys(result.data).length > 0) {
                        if (result.data.createRandomMessage !== undefined && result.data.createRandomMessage.length > 0) {
                            // Return Success
                            const msg = result.data.createRandomMessage;
                            await signRoninMessage(msg, key, address, name); // Run Sign Ronin Message
                        } else {
                            // Return error
                            return reject({error: true});
                        }
                    } else {
                        // Return error
                        return reject({error: true});
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                async (error) => {
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true});
                    
                }
            )
            .catch(
                async (err) => {
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true});
                }
            )
        } catch (err) {
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            return reject({error: true});
        }

        // Get Sign Ronin Message x Second Process
        let signRoninMessage = async (message, key, address, name) => {
            try {
                if (message !== undefined) {
                    const ronweb3 = new Web3(new Web3.providers.HttpProvider('https://api.roninchain.com/rpc'));
                    const sig = ronweb3.eth.accounts.sign(message, key);
                    const signature = sig['signature'];
                    await CreateAccessToken(message, signature, address, name); // Run Create Access Token
                } else {
                    // Instant return error x no other transaction
                    console.log(CONSTANTS.MESSAGE.CANT_GEN_TOKEN_SIGNRONINMSG);
                    return reject({error: true});
                }
            } catch (err) {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                return reject({error: true});
            }
        }

        // Create Access Token x Final Process
        let CreateAccessToken = async (message, signnature, address, name) => {
            try {
                $.ajax({
                    url: "https://graphql-gateway.axieinfinity.com/graphql",
                    type: "POST",
                    data: JSON.stringify({
                        "query": "mutation CreateAccessTokenWithSignature($input:SignatureInput!){createAccessTokenWithSignature(input:$input){newAccount,result,accessToken,__typename}}",
                        "variables": {
                            "input": {
                                "mainnet": "ronin",
                                "owner": address,
                                "message": message,
                                "signature": signnature
                            }
                        }
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': 'http://team-loki.herokuapp.com',
                        'Access-Control-Allow-Credentials': 'true',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    cache: false
                })
                .then(
                    async (result) => {
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
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    async (error) => {
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                        return reject({error: true, name: name});
                        
                    }
                )
                .catch(
                    async (err) => {
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                        return reject({error: true, name: name});
                    }
                )
            } catch (err) {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                return reject({error: true});
            }
        }
    }).catch(err => {
        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
        return err;
    });
};