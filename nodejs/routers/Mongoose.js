/*eslint no-console: 0*/
"use strict";

/**
 * MongoDB Process
 * Objective: Router for Team Loki data
 */

// Dependencies
const express = require("express");
const router = express.Router();
const clientRequest = require("../handlers/ClientRequest");
const { MESSAGE, TABLES } = require("../../client/src/components/Constants");
const MODELS = require("../handlers/MongooseModel")

/**
 * Route Definition: 
 * Method: GET
 * Endpoint for fetching data for Login
 */
router.get("/login", async function (req, res) {
    try {
        // Log the URL Path
        req.logger.info(req.originalUrl);

        // Param payload
        const param = req.query;
        if (param.credential) {
            const access = (decodeURI(param.credential)).replace(/\s+/g, '+'); // Decode URL x replace space from "+" into value of "+"

            // Execute Query
            req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.STARTED);
            MODELS.TBUSERPROFILE.find({
                $or: [
                    { NAME: { $regex: access, $options: 'i' } },
                    { EMAIL: { $regex: access, $options: 'i' } },
                    { SPONSOR_NAME: { $regex: access, $options: 'i' } }
                ]
            }).exec(
                (err, result) => {
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
                }
            );
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

        // Execute Query
        req.logger.info(MESSAGE.TEAMRECORD, MESSAGE.STARTED);
        const users = await MODELS.TBUSERPROFILE.find().exec();
        const withdraws = await MODELS.TBWITHDRAW.find().exec();
        const mEarnings = await MODELS.TBMANAGEREARNED.find().exec();

        req.logger.info(MESSAGE.TEAMRECORD, MESSAGE.END);
        return res.type("application/json").status(200).send({
            error: false,
            data: users ? users : [],
            withdraw: withdraws ? withdraws : [],
            managerEarned: mEarnings ? mEarnings : []
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

        // Find record first to check if duplicate or not
        const foundUser = await MODELS.TBUSERPROFILE.findOne({ ADDRESS: payload.ADDRESS }).exec();

        if (payload.ACTION === MESSAGE.INSERT) {
            // Execute Query x insert new team record
            if (foundUser) {
                // Duplicate data
                req.logger.error(MESSAGE.ERROR_DUPLICATEDATA);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: MESSAGE.ERROR_DUPLICATEDATA
                });
            } else {
                // Continue with the Insert process
                req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.STARTED);
                const result = await new MODELS.TBUSERPROFILE(payload).save().catch(err => {
                    req.logger.error(MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                });
    
                req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        } else if (payload.ACTION === MESSAGE.UPDATE) {
            if (foundUser) {
                // Execute Query x update team record
                req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.UPDATE, MESSAGE.STARTED);
    
                // Update data
                foundUser.NAME = payload.NAME;
                foundUser.EMAIL = payload.EMAIL;
                foundUser.PASS = payload.PASS;
                foundUser.SHR_MANAGER = payload.SHR_MANAGER;
                foundUser.SHR_SCHOLAR = payload.SHR_SCHOLAR;
                foundUser.SHR_SPONSOR = payload.SHR_SPONSOR;
                foundUser.SPONSOR_NAME = payload.SPONSOR_NAME;
                foundUser.STARTED_ON = payload.STARTED_ON;
                foundUser.DELETEIND = payload.DELETEIND;
    
                const result = await foundUser.save().catch(err => {
                    req.logger.error(MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                });
    
                req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            } else {
                // No data to update x Insert new one
                // Continue with the Insert process
                req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.STARTED);
                const result = await new MODELS.TBUSERPROFILE(payload).save().catch(err => {
                    req.logger.error(MESSAGE.ERROR_OCCURED, err);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: err
                    });
                });
    
                req.logger.info(TABLES.TBUSERPROFILE, MESSAGE.INSERT, MESSAGE.END);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
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

        // Execute Query x insert new withdrawal record
        req.logger.info(TABLES.TBWITHDRAW, MESSAGE.INSERT, MESSAGE.STARTED);
        const result = await new MODELS.TBWITHDRAW(payload).save().catch(err => {
            req.logger.error(MESSAGE.ERROR_OCCURED, err);
            return res.type("application/json").status(500).send({
                error: true,
                data: err
            });
        });

        req.logger.info(TABLES.TBWITHDRAW, MESSAGE.INSERT, MESSAGE.END);
        return res.type("application/json").status(200).send({
            error: false,
            data: result
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
 
         // Execute Query x insert new manager earned
         req.logger.info(TABLES.TBMANAGEREARNED, MESSAGE.INSERT, MESSAGE.STARTED);
         const result = await new MODELS.TBMANAGEREARNED(payload).save().catch(err => {
             req.logger.error(MESSAGE.ERROR_OCCURED, err);
             return res.type("application/json").status(500).send({
                 error: true,
                 data: err
             });
         });
 
         req.logger.info(TABLES.TBMANAGEREARNED, MESSAGE.INSERT, MESSAGE.END);
         return res.type("application/json").status(200).send({
             error: false,
             data: result
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