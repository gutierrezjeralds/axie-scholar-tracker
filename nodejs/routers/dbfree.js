/**
 * Heroku Postgresql Process
 * Objective: Router for Team Loki data
 */

// Dependencies
const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const clientRequest = require("../handlers/ClientRequest");
const { SERVERLOGGER, MESSAGE, DB4FREE } = require("../../client/src/components/Constants");

/*
    ReactJS Buildpack Heroku
    ** https://buildpack-registry.s3.amazonaws.com/buildpacks/mars/create-react-app.tgz
*/

const conn = {
    host: process.env.DBFREE_HOST, // Replace with your host name
    user: process.env.DBFREE_USER,      // Replace with your database username
    password: process.env.DBFREE_PASS,      // Replace with your database password
    database: process.env.DBFREE_DB // Replace with your database Name
}

/*
    Tables
    ** TB_USERPROFILE
    **** ID, ADDRESS, NAME, EMAIL, SHR_MANAGER, SHR_SCHOLAR, SHR_SPONSOR, SPONSOR_NAME, STARTED_ON, SLP_CLAIMED, DELETEIND (X), HIGH_SLP_GAIN, HIGH_SLP_DATE
    ** TB_WITHDRAW
    **** ID, ADDRESS, SHR_MANAGER, SHR_SCHOLAR, SHR_SPONSOR, SLPCURRENCY, WITHDRAW_ON
    ** TB_DAILYSLP
    **** ID, ADDRESS, YESTERDAY, YESTERDAYRES, TODAY, TODATE
    ** TB_MANAGEREARNED
    **** ID, SLPTOTAL, SLPCURRENCY, CATEGORY, EARNED_ON
    ** TB_YESTERDAYSLP x This for creating chart for yesterday slp gained
    **** ID, ADDRESS, YESTERDAY, DATE_ON, MMR
*/

// Global console log
const logger = (message, subMessage = "", addedMessage = "") => {
    if (SERVERLOGGER) {
        return console.log(message, subMessage, addedMessage);
    }
}

// All other GET requests not handled before will return our React app
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
// });

// POST Method x Get Access Token
router.post("/authLogin", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_GENERATE_TOKEN);
        
        // Body payload
        const payload = req.body;

        // Execute Process of Auth Login
        const accessToken = await clientRequest.authLogin(payload, logger);
        return res.type("application/json").status(200).send(accessToken); // Return response form Auth Login
    } catch (err) {
        logger(MESSAGE.ERROR_OCCURED, err);
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Get In Game SLP
router.post("/getInGameSLP", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_INGAMESLP_API);
        
        // Body payload
        const payload = req.body;

        // Execute Process of Auth Login
        const inGameSLP = await clientRequest.inGameSLP(payload, logger);
        return res.type("application/json").status(200).send(inGameSLP); // Return response form InGame SLP
    } catch (err) {
        logger(MESSAGE.ERROR_OCCURED, err);
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Get In Game SLP
router.get("/getCryptoCoins", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_CRYPTOCOINS_API);

        // Execute Process of Crypto Coins
        const inGameSLP = await clientRequest.getCryptoCoins(logger);
        return res.type("application/json").status(200).send(inGameSLP); // Return response form InGame SLP
    } catch (err) {
        logger(MESSAGE.ERROR_OCCURED, err);
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// GET Method x Fetch User Profile x TB_USERPROFILE
router.get("/userProfile", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_SELECTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Execute Query x JOIN table
        const query = `${DB4FREE.QUERY.SELECT.USERPROFILE}`;
        dbConn.query(query, (error, result) => {
            logger(MESSAGE.END_SELECTQUERY);
            // End Connection
            dbConn.end();
            if (error) {
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
})

// GET Method x Fetch User Profile x TB_USERPROFILE
router.get("/login", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_SELECTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Param payload
        const param = req.query;
        if (param.credential) {
            const access = (decodeURI(param.credential)).replace(/\s+/g, '+'); // Decode URL x replace space from "+" into value of "+"

            // Execute Query x JOIN table
            const query = `${DB4FREE.QUERY.SELECT.USERPROFILE} WHERE UPPER(NAME) = '${access}' OR UPPER(EMAIL) = '${access}' OR UPPER(SPONSOR_NAME) = '${access}'`;
            dbConn.query(query, (error, result) => {
                logger(MESSAGE.END_SELECTQUERY);
                // End Connection
                dbConn.end();
                if (error) {
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: error
                    });
                } else {
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            return res.type("application/json").status(500).send({
                error: true,
                data: MESSAGE.ERROR_PROCEDURE
            });
        }
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
})

// GET Method x Fetch records x TB_USERPROFILE + TB_WITHDRAW + TB_DAILYSLP
router.get("/records", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_SELECTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Execute Query x JOIN table
        const query = `SELECT USER.*, DAILY.YESTERDAY, DAILY.YESTERDAYRES, DAILY.TODAY, DAILY.TODATE FROM ${DB4FREE.TABLE.USERPROFILE} AS USER JOIN ${DB4FREE.TABLE.DAILYSLP} AS DAILY ON USER.ADDRESS = DAILY.ADDRESS`;
        dbConn.query(query, (error, result) => {
            if (error) {
                logger(MESSAGE.END_SELECTQUERY);
                // End Connection
                dbConn.end();
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                // Execute Query x TB_WITHDRAW
                const query = `${DB4FREE.QUERY.SELECT.WITHDRAW}`;
                dbConn.query(query, (err, dataWithdraw) => {
                    logger(MESSAGE.END_SELECTQUERY);
                    if (err) {
                        // End Connection
                        dbConn.end();
                        return res.type("application/json").status(200).send({
                            error: false,
                            data: result,
                            withdraw: [],
                            managerEarned: []
                        });
                    } else {
                        // Execute Query x TB_YESTERDAYSLP
                        const query = `${DB4FREE.QUERY.SELECT.YESTERDAYSLP}`;
                        dbConn.query(query, (err, dataYesterday) => {
                            logger(MESSAGE.END_SELECTQUERY);
                            if (err) {
                                // End Connection
                                dbConn.end();
                                return res.type("application/json").status(200).send({
                                    error: false,
                                    data: result,
                                    withdraw: dataWithdraw,
                                    yesterdaySLP: [],
                                    managerEarned: []
                                });
                            } else {
                                // Execute Query x TB_MANAGEREARNED
                                const query = `${DB4FREE.QUERY.SELECT.MANAGEREARNED}`;
                                dbConn.query(query, (err, dataManager) => {
                                    logger(MESSAGE.END_SELECTQUERY);
                                    // End Connection
                                    dbConn.end();
                                    if (err) {
                                        return res.type("application/json").status(200).send({
                                            error: false,
                                            data: result,
                                            withdraw: dataWithdraw,
                                            yesterdaySLP: dataYesterday,
                                            managerEarned: []
                                        });
                                    } else {
                                        return res.type("application/json").status(200).send({
                                            error: false,
                                            data: result,
                                            withdraw: dataWithdraw,
                                            yesterdaySLP: dataYesterday,
                                            managerEarned: dataManager
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
})

// POST Method x Saving process of adding new scholar
router.post("/addEditScholar", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_INSERTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();
        
        // Body payload
        const payload = req.body;

        if (payload.ACTION === MESSAGE.INSERT) {
            // Execute Query x insert new team record
            const query = `${DB4FREE.QUERY.INSERT.USERPROFILE} (ADDRESS, NAME, EMAIL, SHR_MANAGER, SHR_SCHOLAR, SHR_SPONSOR, SPONSOR_NAME, STARTED_ON, SLP_CLAIMED, DELETEIND, HIGH_SLP_GAIN, HIGH_SLP_DATE) VALUES ('${payload.ADDRESS}', '${payload.NAME}', '${payload.EMAIL}', '${payload.SHR_MANAGER}', '${payload.SHR_SCHOLAR}', '${payload.SHR_SPONSOR}', '${payload.SPONSOR_NAME}', '${payload.STARTED_ON}', '0', '', '0', '${payload.STARTED_ON}')`;
            dbConn.query(query, (error) => {
                logger(MESSAGE.TEAMRECORD, MESSAGE.STARTED_INSERTQUERY);
                if (error) {
                    logger(MESSAGE.TEAMRECORD, MESSAGE.END_INSERTQUERY, error);
                    // End Connection
                    dbConn.end();
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: error
                    });
                } else {
                    // Execute Query x insert new daily slp record
                    const query = `${DB4FREE.QUERY.INSERT.DAILYSLP} (ADDRESS, YESTERDAY, YESTERDAYRES, TODAY, TODATE) VALUES ('${payload.ADDRESS}', '0', '0', '0','${payload.STARTED_ON}')`;
                    dbConn.query(query, (err, result) => {
                        logger(MESSAGE.DAILYSLP, MESSAGE.STARTED_INSERTQUERY);
                        // End Connection
                        dbConn.end();
                        if (err) {
                            logger(MESSAGE.DAILYSLP, MESSAGE.END_INSERTQUERY, error);
                            return res.type("application/json").status(500).send({
                                error: true,
                                data: err
                            });
                        } else {
                            logger(MESSAGE.DAILYSLP, MESSAGE.END_INSERTQUERY);
                            return res.type("application/json").status(200).send({
                                error: false,
                                data: result
                            });
                        }
                    });
                }
            });
        } else if (payload.ACTION === MESSAGE.UPDATE) {
            // Execute Query x update team record
            const query = `${DB4FREE.QUERY.UPDATE.USERPROFILE} SET ADDRESS = '${payload.ADDRESS}', NAME = '${payload.NAME}', EMAIL = '${payload.EMAIL}', SHR_MANAGER = '${payload.SHR_MANAGER}', SHR_SCHOLAR = '${payload.SHR_SCHOLAR}', SHR_SPONSOR = '${payload.SHR_SPONSOR}', SPONSOR_NAME = '${payload.SPONSOR_NAME}', DELETEIND = '${payload.DELETEIND}' WHERE ADDRESS = '${payload.ADDRESS}'`;
            dbConn.query(query, (error, result) => {
                logger(MESSAGE.STARTED_UPDATEQUERY, payload.ADDRESS);
                // End Connection
                dbConn.end();
                if (error) {
                    logger(MESSAGE.USERPROFILE, MESSAGE.END_UPDATEQUERY, error);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: error
                    });
                } else {
                    logger(MESSAGE.USERPROFILE, MESSAGE.END_UPDATEQUERY);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            return res.type("application/json").status(500).send({
                error: true,
                data: MESSAGE.ERROR_PROCEDURE
            });
        }
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Saving process of Daily SLP x Yesterday and Today
router.post("/dailySLP", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_INSERTQUERY);
        
        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Body payload
        const payload = req.body;

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Execute Query for Daily SLP
                logger(MESSAGE.STARTED_UPDATEQUERY, items.ADDRESS);
                let query = `${DB4FREE.QUERY.UPDATE.DAILYSLP} SET YESTERDAY = '${items.YESTERDAY}', YESTERDAYRES = '${items.YESTERDAYRES}', TODAY = '${items.TODAY}', TODATE = '${items.TODATE}' WHERE ADDRESS = '${items.ADDRESS}'`;
                if (!items.ALLFIELDS) { // False, only TODATE SLP will be updating
                    query = `${DB4FREE.QUERY.UPDATE.DAILYSLP} SET TODAY = '${items.TODAY}' WHERE ADDRESS = '${items.ADDRESS}'`;
                }

                dbConn.query(query, (error) => {
                    logger(MESSAGE.END_UPDATEQUERY, items.ADDRESS);
                    if (error) {
                        logger(MESSAGE.ERROR_PROCEDURE, error);
                    } else {
                        if (items.TBINSERTYESTERDAY) {
                            if (Number(items.YESTERDAYRES) > 0 && Number(items.YESTERDAYRES) <= Number(items.MAXGAINSLP)) { // Insert all positive value x greater than zero
                                // Execute Query for insert Yesterday SLP
                                const insertQuery = `${DB4FREE.QUERY.INSERT.YESTERDAYSLP} (ADDRESS, YESTERDAY, DATE_ON, MMR) VALUES ('${items.ADDRESS}', '${items.YESTERDAYRES}', '${items.YESTERDAYDATE}', '${items.MMR}')`;
                                dbConn.query(insertQuery, (error) => {
                                    logger(MESSAGE.END_INSERTQUERY, items.ADDRESS);
                                    if (error) {
                                        logger(MESSAGE.ERROR_PROCEDURE, error);
                                    }
                                });
                            }
                        } else if (items.TBUPDATEHIGHSLP) { // Update High SLP Gained
                            // Execute Query x update team record
                            const query = `${DB4FREE.QUERY.UPDATE.USERPROFILE} SET HIGH_SLP_GAIN = '${items.HIGHSLPGAIN}', HIGH_SLP_DATE = '${items.HIGHSLPDATE}' WHERE ADDRESS = '${items.ADDRESS}'`;
                            dbConn.query(query, (error) => {
                                logger(MESSAGE.STARTED_UPDATEQUERY, items.ADDRESS);
                                if (error) {
                                    logger(MESSAGE.ERROR_PROCEDURE, error);
                                }
                            });
                        }
                    }
                });
            });

            // Return
            return await Promise.all(upsertProcedure).then(function () {
                // End Connection
                dbConn.end();
                logger(MESSAGE.END_UPDATEQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: payload
                });
            });
        } else {
            return res.type("application/json").status(400).send({
                error: true,
                data: MESSAGE.EMPTYPAYLOAD
            });
        }
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Saving process of Update SLP Claimed in USER PROFILE Table
router.post("/updateSLPClaimed", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_INSERTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Body payload
        const payload = req.body;

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Execute Query for Daily SLP
                logger(MESSAGE.STARTED_UPDATEQUERY, items.ADDRESS);
                query = `${DB4FREE.QUERY.UPDATE.USERPROFILE} SET SLP_CLAIMED = '${items.SLP_CLAIMED}' WHERE ADDRESS = '${items.ADDRESS}'`;
                dbConn.query(query, (error) => {
                    logger(MESSAGE.END_UPDATEQUERY, items.ADDRESS);
                    if (error) {
                        logger(MESSAGE.ERROR_PROCEDURE, error);
                    }
                });
            });

            // Return
            return await Promise.all(upsertProcedure).then(function () {
                // End Connection
                dbConn.end();
                logger(MESSAGE.END_UPDATEQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: payload
                });
            });
        } else {
            return res.type("application/json").status(400).send({
                error: true,
                data: MESSAGE.EMPTYPAYLOAD
            });
        }
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Deletion process of YESTERDAY SLP x Delete the old data
router.post("/deleteYesterdaySLP", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_DELETEQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Body payload
        const payload = req.body;

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Execute Query for Daily SLP
                logger(MESSAGE.STARTED_DELETEQUERY, items.ADDRESS);
                query = `${DB4FREE.QUERY.DELETE.YESTERDAYSLP} WHERE ID = '${items.ID}'`;
                dbConn.query(query, (error) => {
                    logger(MESSAGE.END_DELETEQUERY, items.ADDRESS);
                    if (error) {
                        logger(MESSAGE.ERROR_PROCEDURE, error);
                    }
                });
            });

            // Return
            return await Promise.all(upsertProcedure).then(function () {
                // End Connection
                dbConn.end();
                logger(MESSAGE.END_DELETEQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: payload
                });
            });
        } else {
            return res.type("application/json").status(400).send({
                error: true,
                data: MESSAGE.EMPTYPAYLOAD
            });
        }
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Saving process of team withdraw
router.post("/withdraw", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_INSERTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();
        
        // Body payload
        const payload = req.body;

        // Execute Query x insert new team record
        const query = `${DB4FREE.QUERY.INSERT.WITHDRAW} (ADDRESS, SHR_MANAGER, SHR_SCHOLAR, SHR_SPONSOR, SLPCURRENCY, WITHDRAW_ON) VALUES ('${payload.ADDRESS}', '${payload.SHR_MANAGER}', '${payload.SHR_SCHOLAR}', '${payload.SHR_SPONSOR}', '${payload.SLPCURRENCY}', '${payload.WITHDRAW_ON}')`;
        dbConn.query(query, (error, result) => {
            logger(MESSAGE.WITHDRAW, MESSAGE.STARTED_INSERTQUERY);
            // End Connection
            dbConn.end();
            if (error) {
                logger(MESSAGE.WITHDRAW, MESSAGE.END_INSERTQUERY, error);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                logger(MESSAGE.WITHDRAW, MESSAGE.END_INSERTQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// POST Method x Saving process of manager earned
router.post("/managerEarned", async (req, res) => {
    try {
        logger(MESSAGE.STARTED_INSERTQUERY);

        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();
        
        // Body payload
        const payload = req.body;

        // Execute Query x insert new team record
        const query = `${DB4FREE.QUERY.INSERT.MANAGEREARNED} (SLPTOTAL, SLPCURRENCY, CATEGORY, EARNED_ON) VALUES ('${payload.SLPTOTAL}', '${payload.SLPCURRENCY}', '${payload.CATEGORY}', '${payload.EARNED_ON}')`;
        dbConn.query(query, (error, result) => {
            logger(MESSAGE.MANAGER_EARNED, MESSAGE.STARTED_INSERTQUERY);
            // End Connection
            dbConn.end();
            if (error) {
                logger(MESSAGE.MANAGER_EARNED, MESSAGE.END_INSERTQUERY, error);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                logger(MESSAGE.MANAGER_EARNED, MESSAGE.END_INSERTQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result
                });
            }
        });
    } catch (err) {
        return res.type("application/json").status(500).send({
            error: true,
            data: err
        });
    }
});

// Export the API container
module.exports = router;