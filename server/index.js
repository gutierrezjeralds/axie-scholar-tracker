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
    **** ID, ADDRESS, NAME, EMAIL, SHR_MANAGER, SHR_SCHOLAR, SHR_SPONSOR, SPONSOR_NAME, STARTED_ON
    ** TB_CLAIMED
    **** ID, ADDRESS, SHR_MANAGER, SHR_SCHOLAR, SHR_SPONSOR, SLPCURRENCY, SLPTOTAL, CLAIMED_ON
    ** TB_DAILYSLP
    **** ID, ADDRESS, YESTERDAY, YESTERDAYRES, TODAY, TODATE, TIMESTAMP
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
        STARTEDPOST: "POST Started!",
        ENDPOST: "POST QUERY END!",
        INSERT: "Insert",
        UPDATE: "UPDATE",
        DAILYSLP: "Daily SLP",
        TEAMRECORD: "Team Record"
    },
    TABLE: {
        USERPROFILE: `public."TB_USERPROFILE"`,
        CLAIMED: `public."TB_CLAIMED"`,
        DAILYSLP: `public."TB_DAILYSLP"`,
    },
    QUERY: {
        SELECT: {
            USERPROFILE: `SELECT * FROM public."TB_USERPROFILE`,
            DAILYSLP: `SELECT * FROM public."DAILYSLP`,
            CLAIMED: `SELECT * FROM public."TB_CLAIMED`
        },
        INSERT: {
            USERPROFILE: `INSERT INTO public."TB_USERPROFILE"`,
            DAILYSLP: `INSERT INTO public."TB_DAILYSLP"`
        },
        UPDATE: {
            DAILYSLP: `UPDATE public."TB_DAILYSLP"`
        }
    }
}

// Global console log
const logger = (message, isDevMode = true) => {
    if (!isDevMode) {
        return console.log(message);
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

// GET Method x Fetch records x TB_USERPROFILE + TB_CLAIMED + TB_DAILYSLP
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
                // Execute Query x TB_CLAIMED
                const query = `${CONSTANTS.QUERY.SELECT.CLAIMED}`;
                client.query(query, (err, response) => {
                    logger(CONSTANTS.MESSAGE.END_SELECTQUERY);
                    // End Connection
                    client.end();
                    if (err) {
                        return res.type("application/json").status(200).send({
                            error: false,
                            data: result.rows,
                            claimed: []
                        });
                    } else {
                        return res.type("application/json").status(200).send({
                            error: false,
                            data: result.rows,
                            claimed: response.rows
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
app.post("/api/addScholar", async (req, res) => {
    try {
        logger(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);

        // Conect to postgres
        const client = new Client(pgConn);
        client.connect();
        
        // Body payload
        const payload = req.body;

        // Execute Query x insert new team record
        const query = `${CONSTANTS.QUERY.INSERT.USERPROFILE} ("ADDRESS", "NAME", "EMAIL", "SHR_MANAGER", "SHR_SCHOLAR", "SHR_SPONSOR", "SPONSOR_NAME", "STARTED_ON") VALUES ('${payload.ADDRESS}', '${payload.NAME}', '${payload.EMAIL}', '${payload.SHR_MANAGER}', '${payload.SHR_SCHOLAR}', '${payload.SHR_SPONSOR}', '${payload.SPONSOR_NAME}', '${payload.STARTED_ON}')`;
        client.query(query, (error) => {
            if (error) {
                logger(CONSTANTS.MESSAGE.TEAMRECORD, CONSTANTS.MESSAGE.STARTED_INSERTQUERY);
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
                        return res.type("application/json").status(500).send({
                            error: true,
                            data: err
                        });
                    } else {
                        return res.type("application/json").status(200).send({
                            error: false,
                            data: result
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

                // Execute Query
                logger(`${CONSTANTS.MESSAGE.STARTED_UPDATEQUERY} - ${items.ADDRESS}`);
                let query = `${CONSTANTS.QUERY.UPDATE.DAILYSLP} SET "YESTERDAY" = '${items.YESTERDAY}', "YESTERDAYRES" = '${items.YESTERDAYRES}', "TODAY" = '${items.TODAY}', "TODATE" = '${items.TODATE}' WHERE "ADDRESS" = '${items.ADDRESS}'`;
                if (!items.ALLFIELDS) { // False, only TODATE SLP will be updating
                    query = `${CONSTANTS.QUERY.UPDATE.DAILYSLP} SET "TODAY" = '${items.TODAY}' WHERE "ADDRESS" = '${items.ADDRESS}'`;
                }

                client.query(query, (error) => {
                    // End Connection
                    client.end();
                    logger(`${CONSTANTS.MESSAGE.END_UPDATEQUERY} - ${items.ADDRESS}`);
                    if (error) {
                        logger(`${CONSTANTS.MESSAGE.ERROR_PROCEDURE} ${error}`);
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

app.listen(PORT, () => {
    logger(`Server listening on ${PORT}`);
});