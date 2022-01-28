const path = require('path');
const express = require("express");
const { Client } = require('pg');
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

/*
    ReactJS Buildpack Heroku
    ** https://buildpack-registry.s3.amazonaws.com/buildpacks/mars/create-react-app.tgz
*/

const pgConn = {
    connectionString: "postgres://jxbcqarlcxuwwt:9328a074960dae0975c57dc4a88fd21af6be26c4ef0708316df54368c565da83@ec2-23-23-199-57.compute-1.amazonaws.com:5432/d2kdqt4muprt6i",
    ssl: {
      rejectUnauthorized: false
    }
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

const CONSTANTS = {
    MESSAGE: {
        EMPTYPAYLOAD: "Empty Payload",
        ERROR_PROCEDURE: "Error in QUERY Procedure",
        STARTED_SELECTQUERY: "SELECT QUERY Started!",
        END_SELECTQUERY: "SELECT QUERY END!",
        STARTED_INSERTQUERY: "INSERT QUERY Started!",
        END_INSERTQUERY: "INSERT QUERY END!",
        STARTED_UPDATEQUERY: "UPDATE QUERY Started!",
        END_UPDATEQUERY: "UPDATE QUERY END!",
        STARTED_DELETEQUERY: "DELETE QUERY Started!",
        END_DELETEQUERY: "DELETE QUERY END!",
        STARTEDPOST: "POST Started!",
        ENDPOST: "POST QUERY END!",
        INSERT: "Insert",
        UPDATE: "UPDATE",
        DAILYSLP: "Daily SLP",
        TEAMRECORD: "Team Record",
        WITHDRAW: "Withdraw",
        MANAGER_EARNED: "Manager Earned"
    },
    TABLE: {
        USERPROFILE: `public."TB_USERPROFILE"`,
        WITHDRAW: `public."TB_WITHDRAW"`,
        DAILYSLP: `public."TB_DAILYSLP"`,
    },
    QUERY: {
        SELECT: {
            USERPROFILE: `SELECT * FROM public."TB_USERPROFILE"`,
            DAILYSLP: `SELECT * FROM public."DAILYSLP"`,
            WITHDRAW: `SELECT * FROM public."TB_WITHDRAW"`,
            MANAGEREARNED: `SELECT * FROM public."TB_MANAGEREARNED"`,
            YESTERDAYSLP: `SELECT * FROM public."TB_YESTERDAYSLP"`
        },
        INSERT: {
            USERPROFILE: `INSERT INTO public."TB_USERPROFILE"`,
            DAILYSLP: `INSERT INTO public."TB_DAILYSLP"`,
            WITHDRAW: `INSERT INTO public."TB_WITHDRAW"`,
            MANAGEREARNED: `INSERT INTO public."TB_MANAGEREARNED"`,
            YESTERDAYSLP: `INSERT INTO public."TB_YESTERDAYSLP"`
        },
        UPDATE: {
            USERPROFILE: `UPDATE public."TB_USERPROFILE"`,
            DAILYSLP: `UPDATE public."TB_DAILYSLP"`
        },
        DELETE: {
            YESTERDAYSLP: `DELETE FROM public."TB_YESTERDAYSLP"`
        }
    }
}

// Global console log
const logger = (message, subMessage = "", addedMessage = "", isDevMode = false) => {
    if (isDevMode) {
        return console.log(message, subMessage, addedMessage);
    }
}

// Get Method x Test server
app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

// All other GET requests not handled before will return our React app
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
// });

// GET Method x Fetch User Profile x TB_USERPROFILE
app.get("/api/userProfile", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_SELECTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();

        // Execute Query x JOIN table
        const query = `${CONSTANTS.QUERY.SELECT.USERPROFILE}`;
        client.query(query, (error, result) => {
            logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
            // End Connection
            client.end();
            if (error) {
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                return res.type("application/json").status(200).send({
                    error: false,
                    data: result.rows
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
app.get("/api/userProfile/login", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_SELECTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();

        // Param payload
        const param = req.query;
        if (param.credential) {
            const access = (decodeURI(param.credential)).replace(/\s+/g, '+'); // Decode URL x replace space from "+" into value of "+"

            // Execute Query x JOIN table
            const query = `${CONSTANTS.QUERY.SELECT.USERPROFILE} WHERE UPPER("NAME") = '${access}' OR UPPER("EMAIL") = '${access}' OR UPPER("SPONSOR_NAME") = '${access}'`;
            client.query(query, (error, result) => {
                logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
                // End Connection
                client.end();
                if (error) {
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: error
                    });
                } else {
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result.rows
                    });
                }
            });
        } else {
            return res.type("application/json").status(500).send({
                error: true,
                data: CONSTANTS.MESSAGE.ERROR_PROCEDURE
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
app.get("/api/records", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_SELECTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();

        // Execute Query x JOIN table
        const query = `SELECT "USER".*, "DAILY"."YESTERDAY", "DAILY"."YESTERDAYRES", "DAILY"."TODAY", "DAILY"."TODATE" FROM ${CONSTANTS.TABLE.USERPROFILE} AS "USER" JOIN ${CONSTANTS.TABLE.DAILYSLP} AS "DAILY" ON "USER"."ADDRESS" = "DAILY"."ADDRESS"`;
        client.query(query, (error, result) => {
            if (error) {
                logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
                // End Connection
                client.end();
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                // Execute Query x TB_WITHDRAW
                const query = `${CONSTANTS.QUERY.SELECT.WITHDRAW}`;
                client.query(query, (err, dataWithdraw) => {
                    logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
                    if (err) {
                        // End Connection
                        client.end();
                        return res.type("application/json").status(200).send({
                            error: false,
                            data: result.rows,
                            withdraw: [],
                            managerEarned: []
                        });
                    } else {
                        // Execute Query x TB_YESTERDAYSLP
                        const query = `${CONSTANTS.QUERY.SELECT.YESTERDAYSLP}`;
                        client.query(query, (err, dataYesterday) => {
                            logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
                            if (err) {
                                // End Connection
                                client.end();
                                return res.type("application/json").status(200).send({
                                    error: false,
                                    data: result.rows,
                                    withdraw: dataWithdraw.rows,
                                    yesterdaySLP: [],
                                    managerEarned: []
                                });
                            } else {
                                // Execute Query x TB_MANAGEREARNED
                                const query = `${CONSTANTS.QUERY.SELECT.MANAGEREARNED}`;
                                client.query(query, (err, dataManager) => {
                                    logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
                                    // End Connection
                                    client.end();
                                    if (err) {
                                        return res.type("application/json").status(200).send({
                                            error: false,
                                            data: result.rows,
                                            withdraw: dataWithdraw.rows,
                                            yesterdaySLP: dataYesterday.rows,
                                            managerEarned: []
                                        });
                                    } else {
                                        return res.type("application/json").status(200).send({
                                            error: false,
                                            data: result.rows,
                                            withdraw: dataWithdraw.rows,
                                            yesterdaySLP: dataYesterday.rows,
                                            managerEarned: dataManager.rows
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
app.post("/api/addEditScholar", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();
        
        // Body payload
        const payload = req.body;

        if (payload.ACTION === CONSTANTS.MESSAGE.INSERT) {
            // Execute Query x insert new team record
            const query = `${CONSTANTS.QUERY.INSERT.USERPROFILE} ("ADDRESS", "NAME", "EMAIL", "SHR_MANAGER", "SHR_SCHOLAR", "SHR_SPONSOR", "SPONSOR_NAME", "STARTED_ON", "SLP_CLAIMED", "DELETEIND") VALUES ('${payload.ADDRESS}', '${payload.NAME}', '${payload.EMAIL}', '${payload.SHR_MANAGER}', '${payload.SHR_SCHOLAR}', '${payload.SHR_SPONSOR}', '${payload.SPONSOR_NAME}', '${payload.STARTED_ON}', '0', '')`;
            client.query(query, (error) => {
                logger(CONSTANTS.MESSAGE.TEAMRECORD, CONSTANTS.MESSAGE.STARTED_INSERTQUERY);
                if (error) {
                    logger(CONSTANTS.MESSAGE.TEAMRECORD, CONSTANTS.MESSAGE.END_INSERTQUERY, error);
                    // End Connection
                    client.end();
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: error
                    });
                } else {
                    // Execute Query x insert new daily slp record
                    const query = `${CONSTANTS.QUERY.INSERT.DAILYSLP} ("ADDRESS", "YESTERDAY", "YESTERDAYRES", "TODAY", "TODATE") VALUES ('${payload.ADDRESS}', '0', '0', '0','${payload.STARTED_ON}')`;
                    client.query(query, (err, result) => {
                        logger(CONSTANTS.MESSAGE.DAILYSLP, CONSTANTS.MESSAGE.STARTED_INSERTQUERY);
                        // End Connection
                        client.end();
                        if (err) {
                            logger(CONSTANTS.MESSAGE.DAILYSLP, CONSTANTS.MESSAGE.END_INSERTQUERY, error);
                            return res.type("application/json").status(500).send({
                                error: true,
                                data: err
                            });
                        } else {
                            logger(CONSTANTS.MESSAGE.DAILYSLP, CONSTANTS.MESSAGE.END_INSERTQUERY);
                            return res.type("application/json").status(200).send({
                                error: false,
                                data: result
                            });
                        }
                    });
                }
            });
        } else if (payload.ACTION === CONSTANTS.MESSAGE.UPDATE) {
            // Execute Query x update team record
            const query = `${CONSTANTS.QUERY.UPDATE.USERPROFILE} SET "ADDRESS" = '${payload.ADDRESS}', "NAME" = '${payload.NAME}', "EMAIL" = '${payload.EMAIL}', "SHR_MANAGER" = '${payload.SHR_MANAGER}', "SHR_SCHOLAR" = '${payload.SHR_SCHOLAR}', "SHR_SPONSOR" = '${payload.SHR_SPONSOR}', "SPONSOR_NAME" = '${payload.SPONSOR_NAME}', "DELETEIND" = '${payload.DELETEIND}' WHERE "ADDRESS" = '${payload.ADDRESS}'`;
            client.query(query, (error, result) => {
                logger(CONSTANTS.MESSAGE.STARTED_UPDATEQUERY, payload.ADDRESS);
                // End Connection
                client.end();
                if (error) {
                    logger(CONSTANTS.MESSAGE.USERPROFILE, CONSTANTS.MESSAGE.END_UPDATEQUERY, error);
                    return res.type("application/json").status(500).send({
                        error: true,
                        data: error
                    });
                } else {
                    logger(CONSTANTS.MESSAGE.USERPROFILE, CONSTANTS.MESSAGE.END_UPDATEQUERY);
                    return res.type("application/json").status(200).send({
                        error: false,
                        data: result
                    });
                }
            });
        } else {
            return res.type("application/json").status(500).send({
                error: true,
                data: CONSTANTS.MESSAGE.ERROR_PROCEDURE
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
app.post("/api/dailySLP", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);

        // Body payload
        const payload = req.body;

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Conect to postgres
                const client = new Client(pgConn);
                client.connect();

                // Execute Query for Daily SLP
                logger(CONSTANTS.MESSAGE.STARTED_UPDATEQUERY, items.ADDRESS);
                let query = `${CONSTANTS.QUERY.UPDATE.DAILYSLP} SET "YESTERDAY" = '${items.YESTERDAY}', "YESTERDAYRES" = '${items.YESTERDAYRES}', "TODAY" = '${items.TODAY}', "TODATE" = '${items.TODATE}' WHERE "ADDRESS" = '${items.ADDRESS}'`;
                if (!items.ALLFIELDS) { // False, only TODATE SLP will be updating
                    query = `${CONSTANTS.QUERY.UPDATE.DAILYSLP} SET "TODAY" = '${items.TODAY}' WHERE "ADDRESS" = '${items.ADDRESS}'`;
                }

                client.query(query, (error) => {
                    logger(CONSTANTS.MESSAGE.END_UPDATEQUERY, items.ADDRESS);
                    if (error) {
                        // End Connection
                        client.end();
                        logger(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                    } else {
                        if (items.TBINSERTYESTERDAY) {
                            if (Number(items.YESTERDAYRES) > 0 && Number(items.YESTERDAYRES) <= Number(items.MAXGAINSLP)) { // Insert all positive value x greater than zero
                                // Execute Query for insert Yesterday SLP
                                const insertQuery = `${CONSTANTS.QUERY.INSERT.YESTERDAYSLP} ("ADDRESS", "YESTERDAY", "DATE_ON", "MMR") VALUES ('${items.ADDRESS}', '${items.YESTERDAYRES}', '${items.YESTERDAYDATE}', '${items.MMR}')`;
                                client.query(insertQuery, (error) => {
                                    logger(CONSTANTS.MESSAGE.END_INSERTQUERY, items.ADDRESS);
                                    // End Connection
                                    client.end();
                                    if (error) {
                                        logger(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                                    }
                                });
                            } else {
                                // End Connection
                                client.end();
                            }
                        } else if (items.TBUPDATEHIGHSLP) { // Update High SLP Gained
                            // Execute Query x update team record
                            const query = `${CONSTANTS.QUERY.UPDATE.USERPROFILE} SET "HIGH_SLP_GAIN" = '${items.HIGHSLPGAIN}', "HIGH_SLP_DATE" = '${items.HIGHSLPDATE}' WHERE "ADDRESS" = '${items.ADDRESS}'`;
                            client.query(query, (error) => {
                                logger(CONSTANTS.MESSAGE.STARTED_UPDATEQUERY, items.ADDRESS);
                                // End Connection
                                client.end();
                                if (error) {
                                    logger(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                                }
                            });
                        } else {
                            // End Connection
                            client.end();
                        }
                    }
                });
            });

            // Return
            return await Promise.all(upsertProcedure).then(function () {
                logger(CONSTANTS.MESSAGE.END_UPDATEQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: payload
                });
            });
        } else {
            return res.type("application/json").status(400).send({
                error: true,
                data: CONSTANTS.MESSAGE.EMPTYPAYLOAD
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
app.post("/api/updateSLPClaimed", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);

        // Body payload
        const payload = req.body;

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Conect to postgres
                const client = new Client(pgConn);
                client.connect();

                // Execute Query for Daily SLP
                logger(CONSTANTS.MESSAGE.STARTED_UPDATEQUERY, items.ADDRESS);
                query = `${CONSTANTS.QUERY.UPDATE.USERPROFILE} SET "SLP_CLAIMED" = '${items.SLP_CLAIMED}' WHERE "ADDRESS" = '${items.ADDRESS}'`;
                client.query(query, (error) => {
                    logger(CONSTANTS.MESSAGE.END_UPDATEQUERY, items.ADDRESS);
                    // End Connection
                    client.end();
                    if (error) {
                        logger(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                    }
                });
            });

            // Return
            return await Promise.all(upsertProcedure).then(function () {
                logger(CONSTANTS.MESSAGE.END_UPDATEQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: payload
                });
            });
        } else {
            return res.type("application/json").status(400).send({
                error: true,
                data: CONSTANTS.MESSAGE.EMPTYPAYLOAD
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
app.post("/api/deleteYesterdaySLP", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_DELETEQUERY);

        // Body payload
        const payload = req.body;

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Conect to postgres
                const client = new Client(pgConn);
                client.connect();

                // Execute Query for Daily SLP
                logger(CONSTANTS.MESSAGE.STARTED_DELETEQUERY, items.ADDRESS);
                query = `${CONSTANTS.QUERY.DELETE.YESTERDAYSLP} WHERE "ID" = '${items.ID}'`;
                client.query(query, (error) => {
                    logger(CONSTANTS.MESSAGE.END_DELETEQUERY, items.ADDRESS);
                    // End Connection
                    client.end();
                    if (error) {
                        logger(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                    }
                });
            });

            // Return
            return await Promise.all(upsertProcedure).then(function () {
                logger(CONSTANTS.MESSAGE.END_DELETEQUERY);
                return res.type("application/json").status(200).send({
                    error: false,
                    data: payload
                });
            });
        } else {
            return res.type("application/json").status(400).send({
                error: true,
                data: CONSTANTS.MESSAGE.EMPTYPAYLOAD
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
app.post("/api/withdraw", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();
        
        // Body payload
        const payload = req.body;

        // Execute Query x insert new team record
        const query = `${CONSTANTS.QUERY.INSERT.WITHDRAW} ("ADDRESS", "SHR_MANAGER", "SHR_SCHOLAR", "SHR_SPONSOR", "SLPCURRENCY", "WITHDRAW_ON") VALUES ('${payload.ADDRESS}', '${payload.SHR_MANAGER}', '${payload.SHR_SCHOLAR}', '${payload.SHR_SPONSOR}', '${payload.SLPCURRENCY}', '${payload.WITHDRAW_ON}')`;
        client.query(query, (error, result) => {
            logger(CONSTANTS.MESSAGE.WITHDRAW, CONSTANTS.MESSAGE.STARTED_INSERTQUERY);
            // End Connection
            client.end();
            if (error) {
                logger(CONSTANTS.MESSAGE.WITHDRAW, CONSTANTS.MESSAGE.END_INSERTQUERY, error);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                logger(CONSTANTS.MESSAGE.WITHDRAW, CONSTANTS.MESSAGE.END_INSERTQUERY);
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
app.post("/api/managerEarned", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();
        
        // Body payload
        const payload = req.body;

        // Execute Query x insert new team record
        const query = `${CONSTANTS.QUERY.INSERT.MANAGEREARNED} ("SLPTOTAL", "SLPCURRENCY", "CATEGORY", "EARNED_ON") VALUES ('${payload.SLPTOTAL}', '${payload.SLPCURRENCY}', '${payload.CATEGORY}', '${payload.EARNED_ON}')`;
        client.query(query, (error, result) => {
            logger(CONSTANTS.MESSAGE.MANAGER_EARNED, CONSTANTS.MESSAGE.STARTED_INSERTQUERY);
            // End Connection
            client.end();
            if (error) {
                logger(CONSTANTS.MESSAGE.MANAGER_EARNED, CONSTANTS.MESSAGE.END_INSERTQUERY, error);
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                logger(CONSTANTS.MESSAGE.MANAGER_EARNED, CONSTANTS.MESSAGE.END_INSERTQUERY);
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

app.listen(PORT, () => {
    logger(`Server listening on ${PORT}`);
});