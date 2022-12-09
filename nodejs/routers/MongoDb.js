/*eslint no-console: 0*/
"use strict";

/**
 * MongoDB Process
 * Objective: Router for Team Loki data
 */

// Dependencies
const express = require("express");
const router = express.Router();
const dbConnection = require('../dbconn/dbconn');
const clientRequest = require("../handlers/ClientRequest");
const { MESSAGE, TABLES } = require("../../client/src/components/Constants");

/**
 * Route Definition: 
 * Method: GET
 * Endpoint for fetching data for Login
 */
 router.get("/login", async function (req, res) {
    try {
        // Log the URL Path
        req.logger.info(req.originalUrl);

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Param payload
        const param = req.query;
        if (param.credential) {
            const access = (decodeURI(param.credential)).replace(/\s+/g, '+'); // Decode URL x replace space from "+" into value of "+"

            // Execute Query
            req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.STARTED);
            dbConn.collection(TABLES.TBUSERPROFILE).find({
                $or: [
                   { NAME: { $regex: access, $options: 'i' } },
                   { EMAIL: { $regex: access, $options: 'i' } },
                   { SPONSOR_NAME: { $regex: access, $options: 'i' } }
                ]
            }).toArray(function (err, result) {
                if (err) {
                    req.logger.error(MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                } else {
                    req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.END);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            req.logger.error(MESSAGE.ERROR_PROCEDURE);
            return res.type("application/json").status(500).send({
                error: true,
                data: MESSAGE.ERROR_PROCEDURE
            });
        }
    } catch (err) {
        req.logger.error(MESSAGE.ERROR_OCCURED, err);
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
 });

 /**
 * Route Definition: 
 * Method: GET
 * Endpoint for fetching all data
 * TB_USERPROFILE + TB_MANAGEREARNED + TB_WITHDRAW
 */
router.get("/records", async function (req, res) {
    try {
        // Log the URL Path
        req.logger.info(req.originalUrl);

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Execute Query
        req.logger.info(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.STARTED);
        dbConn.collection(TABLES.TBUSERPROFILE).find().toArray(function (err, result) {
            if (err) {
                req.logger.error(MESSAGE.ERROR_OCCURED, err);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: err
                });
            } else {
                req.logger.info(TABLES.TBWITHDRAW, MESSAGE.STARTED);
                dbConn.collection(TABLES.TBWITHDRAW).find().toArray(function (err, dataWithdraw) {
                    if (err) {
                        req.logger.error(MESSAGE.ERROR_OCCURED, err);
                        return res.type("application/json").status(200).send({
                            error: true,
                            data: result,
                            withdraw: [],
                            managerEarned: []
                        });
                    } else {
                        req.logger.info(TABLES.TBMANAGEREARNED, MESSAGE.STARTED);
                        dbConn.collection(TABLES.TBMANAGEREARNED).find().toArray(function (err, dataManager) {
                            if (err) {
                                req.logger.error(MESSAGE.ERROR_OCCURED, err);
                                return res.type("application/json").status(200).send({
                                    error: true,
                                    data: result,
                                    withdraw: dataWithdraw,
                                    managerEarned: []
                                });
                            } else {
                                req.logger.info(req.originalUrl, MESSAGE.END);
                                return res.type("application/json").status(200).send({
                                    error: false,
                                    data: result,
                                    withdraw: dataWithdraw,
                                    managerEarned: dataManager
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        req.logger.error(MESSAGE.ERROR_OCCURED, err);
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

/**
* Route Definition: 
* Method: POST
* Endpoint for insert data of new scholar
*/
router.post("/addEditScholar", async function (req, res) {
   try {
        // Log the URL Path
        req.logger.info(req.originalUrl);

        // Body payload
        const payload = req.body;

        // DB Connection
        const dbConn = dbConnection.getDb();

        if (payload.ACTION === MESSAGE.INSERT) {
            // Execute Query x insert new team record
            req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.STARTED);
            dbConn.collection(TABLES.TBUSERPROFILE).insertOne({
                ADDRESS: payload.ADDRESS,
                NAME: payload.NAME,
                EMAIL: payload.EMAIL,
                PASS: payload.PASS,
                SHR_MANAGER: payload.SHR_MANAGER,
                SHR_SCHOLAR: payload.SHR_SCHOLAR,
                SHR_SPONSOR: payload.SHR_SPONSOR,
                SPONSOR_NAME: payload.SPONSOR_NAME,
                STARTED_ON: payload.STARTED_ON,
                DELETEIND: payload.DELETEIND
            }, function (err, result) {
                if (err) {
                    req.logger.error(MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                } else {
                    req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.END);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else if (payload.ACTION === MESSAGE.UPDATE) {
            // Execute Query x update team record
            req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.UPDATE, MESSAGE.STARTED);
            dbConn.collection(TABLES.TBUSERPROFILE).updateOne({ ADDRESS: payload.ADDRESS }, {
                $set: {
                    NAME: payload.NAME,
                    EMAIL: payload.EMAIL,
                    PASS: payload.PASS,
                    SHR_MANAGER: payload.SHR_MANAGER,
                    SHR_SCHOLAR: payload.SHR_SCHOLAR,
                    SHR_SPONSOR: payload.SHR_SPONSOR,
                    SPONSOR_NAME: payload.SPONSOR_NAME,
                    STARTED_ON: payload.STARTED_ON,
                    DELETEIND: payload.DELETEIND
                }
            }, function (err, result) {
                if (err) {
                    req.logger.error(MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                } else {
                    req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.UPDATE, MESSAGE.END);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            req.logger.error(MESSAGE.ERROR_PROCEDURE);
            return res.type("application/json").status(500).send({
                error: true,
                data: MESSAGE.ERROR_PROCEDURE
            });
        }
   } catch (err) {
       req.logger.error(MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

/**
* Route Definition: 
* Method: POST
* Endpoint for insert data of scholar withdrawal
*/
router.post("/withdraw", async function (req, res) {
   try {
        // Log the URL Path
        req.logger.info(req.originalUrl);

        // Body payload
        const payload = req.body;

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Execute Query x insert new withdrawal record
        req.logger.info(TABLES.TBWITHDRAW, MESSAGE.INSERT, MESSAGE.STARTED);
        dbConn.collection(TABLES.TBWITHDRAW).insertOne({
            ADDRESS: payload.ADDRESS,
            SLPTOTAL: payload.SLPTOTAL,
            SLPCURRENCY: payload.SLPCURRENCY,
            WITHDRAW_ON: payload.WITHDRAW_ON
        }, function (err, result) {
            if (err) {
                req.logger.error(MESSAGE.ERROR_OCCURED, err);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: err
                });
            } else {
                req.logger.info(TABLES.TBWITHDRAW, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
   } catch (err) {
       req.logger.error(MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

/**
* Route Definition: 
* Method: POST
* Endpoint for insert data of Manager Earned
*/
router.post("/managerEarned", async function (req, res) {
   try {
        // Log the URL Path
        req.logger.info(req.originalUrl);

        // Body payload
        const payload = req.body;

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Execute Query x insert new manager earned
        req.logger.info(TABLES.TBMANAGEREARNED, MESSAGE.INSERT, MESSAGE.STARTED);
        dbConn.collection(TABLES.TBMANAGEREARNED).insertOne({
            SLPTOTAL: payload.SLPTOTAL,
            SLPCURRENCY: payload.SLPCURRENCY,
            CATEGORY: payload.CATEGORY,
            EARNED_ON: payload.EARNED_ON
        }, function (err, result) {
            if (err) {
                req.logger.error(MESSAGE.ERROR_OCCURED, err);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: err
                });
            } else {
                req.logger.info(TABLES.TBMANAGEREARNED, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
   } catch (err) {
       req.logger.error(MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

/**
* Route Definition:
* Method: POST
* Endpoint for Get Access Token via client API
*/
router.post("/authLogin", async function (req, res) {
   try {
       // Log the URL Path
       req.logger.info(req.originalUrl);
       
       // Body payload
       const payload = req.body;

       // Execute Process of Auth Login
       const accessToken = await clientRequest.authLogin(payload, req.logger);
       return res.type("application/json").status(200).send(accessToken); // Return response form Auth Login
   } catch (err) {
       req.logger.error(MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

/**
* Route Definition: 
* Method: POST
* Endpoint for Get InGame SLP via client API
*/
router.post("/getInGameSLP", async function (req, res) {
   try {
       // Log the URL Path
       req.logger.info(req.originalUrl);
       
       // Body payload
       const payload = req.body;

       // Execute Process of Auth Login
       const inGameSLP = await clientRequest.inGameSLP(payload, req.logger);
       return res.type("application/json").status(200).send(inGameSLP); // Return response form InGame SLP
   } catch (err) {
       req.logger.error(MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

/**
* Route Definition: 
* Method: GET
* Endpoint for Get Crypto Coin value via client API
*/
router.get("/getCryptoCoins", async function (req, res) {
   try {
       // Log the URL Path
       req.logger.info(req.originalUrl);

       // Execute Process of Crypto Coins
       const inGameSLP = await clientRequest.getCryptoCoins(req.logger);
       return res.type("application/json").status(200).send(inGameSLP); // Return response form InGame SLP
   } catch (err) {
       req.logger.error(MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

// Export the API container
module.exports = router;