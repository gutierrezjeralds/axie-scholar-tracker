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
const { ISDEVLOGGER, LOGTAIL, MESSAGE, TABLES } = require("../../client/src/components/Constants");
const { Logtail } = require("@logtail/node");

// Global console log
const logtail = new Logtail(LOGTAIL);
const logger = (level, message, subMessage = "", addedMessage = "") => {
    if (ISDEVLOGGER) {
        return console.log(message, subMessage, addedMessage);
    } else {
        try {
            subMessage = typeof subMessage === "string" ? subMessage : JSON.stringify(subMessage);
            addedMessage = typeof addedMessage === "string" ? addedMessage : JSON.stringify(addedMessage);
            const msg = message + " " + subMessage + " " + addedMessage;
            if (level === MESSAGE.INFO) {
                logtail.info(msg);
            } else {
                logtail.error(msg);
            }
        } catch {
            return console.log(message, subMessage, addedMessage);
        }
    }
}

/**
 * Route Definition: 
 * Method: GET
 * Endpoint for fetching data for Login
 */
 router.get("/login", async function (req, res) {
    try {
        // Log the URL Path
        logger(MESSAGE.INFO, req.originalUrl);

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Param payload
        const param = req.query;
        if (param.credential) {
            const access = (decodeURI(param.credential)).replace(/\s+/g, '+'); // Decode URL x replace space from "+" into value of "+"

            // Execute Query
            logger(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.STARTED);
            dbConn.collection(TABLES.TBUSERPROFILE).find({
                $or: [
                   { NAME: { $regex: access, $options: 'i' } },
                   { EMAIL: { $regex: access, $options: 'i' } },
                   { SPONSOR_NAME: { $regex: access, $options: 'i' } }
                ]
            }).toArray(function (err, result) {
                if (err) {
                    logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                } else {
                    logger(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.END);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            logger(MESSAGE.ERROR, MESSAGE.ERROR_PROCEDURE);
            return res.type("application/json").status(500).send({
                error: true,
                data: MESSAGE.ERROR_PROCEDURE
            });
        }
    } catch (err) {
        logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
        logger(MESSAGE.INFO, req.originalUrl);

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Execute Query
        logger(MESSAGE.INFO, MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.STARTED);
        dbConn.collection(TABLES.TBUSERPROFILE).find().toArray(function (err, result) {
            if (err) {
                logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: err
                });
            } else {
                logger(MESSAGE.INFO, TABLES.TBWITHDRAW, MESSAGE.STARTED);
                dbConn.collection(TABLES.TBWITHDRAW).find().toArray(function (err, dataWithdraw) {
                    if (err) {
                        logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                        return res.type("application/json").status(200).send({
                            error: true,
                            data: result,
                            withdraw: [],
                            managerEarned: []
                        });
                    } else {
                        logger(MESSAGE.INFO, TABLES.TBMANAGEREARNED, MESSAGE.STARTED);
                        dbConn.collection(TABLES.TBMANAGEREARNED).find().toArray(function (err, dataManager) {
                            if (err) {
                                logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                                return res.type("application/json").status(200).send({
                                    error: true,
                                    data: result,
                                    withdraw: dataWithdraw,
                                    managerEarned: []
                                });
                            } else {
                                logger(MESSAGE.INFO, req.originalUrl, MESSAGE.END);
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
        logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
        logger(MESSAGE.INFO, req.originalUrl);

        // Body payload
        const payload = req.body;

        // DB Connection
        const dbConn = dbConnection.getDb();

        if (payload.ACTION === MESSAGE.INSERT) {
            // Execute Query x insert new team record
            logger(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.STARTED);
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
                    logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                } else {
                    logger(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.END);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else if (payload.ACTION === MESSAGE.UPDATE) {
            // Execute Query x update team record
            logger(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.UPDATE, MESSAGE.STARTED);
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
                    logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                } else {
                    logger(MESSAGE.INFO, TABLES.TBUSERPROFILE, MESSAGE.UPDATE, MESSAGE.END);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            logger(MESSAGE.ERROR, MESSAGE.ERROR_PROCEDURE);
            return res.type("application/json").status(500).send({
                error: true,
                data: MESSAGE.ERROR_PROCEDURE
            });
        }
   } catch (err) {
       logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
        logger(MESSAGE.INFO, req.originalUrl);

        // Body payload
        const payload = req.body;

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Execute Query x insert new withdrawal record
        logger(MESSAGE.INFO, TABLES.TBWITHDRAW, MESSAGE.INSERT, MESSAGE.STARTED);
        dbConn.collection(TABLES.TBWITHDRAW).insertOne({
            ADDRESS: payload.ADDRESS,
            SLPTOTAL: payload.SLPTOTAL,
            SLPCURRENCY: payload.SLPCURRENCY,
            WITHDRAW_ON: payload.WITHDRAW_ON
        }, function (err, result) {
            if (err) {
                logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: err
                });
            } else {
                logger(MESSAGE.INFO, TABLES.TBWITHDRAW, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
   } catch (err) {
       logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
        logger(MESSAGE.INFO, req.originalUrl);

        // Body payload
        const payload = req.body;

        // DB Connection
        const dbConn = dbConnection.getDb();

        // Execute Query x insert new manager earned
        logger(MESSAGE.INFO, TABLES.TBMANAGEREARNED, MESSAGE.INSERT, MESSAGE.STARTED);
        dbConn.collection(TABLES.TBMANAGEREARNED).insertOne({
            SLPTOTAL: payload.SLPTOTAL,
            SLPCURRENCY: payload.SLPCURRENCY,
            CATEGORY: payload.CATEGORY,
            EARNED_ON: payload.EARNED_ON
        }, function (err, result) {
            if (err) {
                logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: err
                });
            } else {
                logger(MESSAGE.INFO, TABLES.TBMANAGEREARNED, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
   } catch (err) {
       logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
       logger(MESSAGE.INFO, req.originalUrl);
       
       // Body payload
       const payload = req.body;

       // Execute Process of Auth Login
       const accessToken = await clientRequest.authLogin(payload, logger);
       return res.type("application/json").status(200).send(accessToken); // Return response form Auth Login
   } catch (err) {
       logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
       logger(MESSAGE.INFO, req.originalUrl);
       
       // Body payload
       const payload = req.body;

       // Execute Process of Auth Login
       const inGameSLP = await clientRequest.inGameSLP(payload, logger);
       return res.type("application/json").status(200).send(inGameSLP); // Return response form InGame SLP
   } catch (err) {
       logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
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
       logger(MESSAGE.INFO, req.originalUrl);

       // Execute Process of Crypto Coins
       const inGameSLP = await clientRequest.getCryptoCoins(logger);
       return res.type("application/json").status(200).send(inGameSLP); // Return response form InGame SLP
   } catch (err) {
       logger(MESSAGE.ERROR, MESSAGE.ERROR_OCCURED, err);
       return res.type("application/json").status(500).send({
           error: true,
           data: err
       });
   }
});

// Export the API container
module.exports = router;