const path = require('path');
const express = require("express");
const mysql = require("mysql");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

/*
    https://www.freemysqlhosting.net/
    ReactJS Buildpack Heroku
    ** https://buildpack-registry.s3.amazonaws.com/buildpacks/mars/create-react-app.tgz
*/
const conn = {
    host: "sql6.freemysqlhosting.net", // Replace with your host name
    user: "sql6445790",      // Replace with your database username
    password: "bsgxsq6bAu",      // Replace with your database password
    database: "sql6445790" // Replace with your database Name
}

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
        UPDATE: "UPDATE"
    },
    QUERY: {
        SELECT: {
            DAILYSLP: `SELECT * FROM TB_DAILYSLP`
        },
        INSERT: {
            DAILYSLP: `INSERT INTO TB_DAILYSLP`
        },
        UPDATE: {
            DAILYSLP: `UPDATE TB_DAILYSLP`
        }
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

// GET Method x Daily SLP x Yesterday and Today
app.get("/api/dailySLP", async (req, res) => {
    try {
        console.log(CONSTANTS.MESSAGE.STARTED_SELECTQUERY);
        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        // Execute Query
        const query = `${CONSTANTS.QUERY.SELECT.DAILYSLP}`;
        dbConn.query(query, function (error, results) {
            console.log(CONSTANTS.MESSAGE.END_SELECTQUERY);
            console.log(CONSTANTS.MESSAGE.END_SELECTQUERY, results);
            // End DB Connection
            dbConn.end();
            if (error) {
                return res.type("application/json").status(500).send({
                    error: true,
                    data: error
                });
            } else {
                return res.type("application/json").status(200).send({
                    error: false,
                    data: results
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
        // Body payload
        const payload = req.body;
        // Create DB Connection
        const dbConn = mysql.createConnection({
            host     : conn.host,
            user     : conn.user,
            password : conn.password,
            database : conn.database
        });
        dbConn.connect();

        if (payload.length > 0) {
            // Map the payload for multiple data
            const upsertProcedure = payload.map((items) => {
                // Execute Query
                console.log(CONSTANTS.MESSAGE.STARTEDPOST, items.ADDRESS);
                if (items.ACTION === CONSTANTS.MESSAGE.INSERT) { // INSERT
                    console.log(CONSTANTS.MESSAGE.STARTED_INSERTQUERY);
                    const query = `${CONSTANTS.QUERY.INSERT.DAILYSLP} (ADDRESS, YESTERDAY, TODAY, TODATE) VALUES ('${items.ADDRESS}', '${items.YESTERDAY}', '${items.TODAY}', '${items.TODATE}') ON DUPLICATE KEY UPDATE ADDRESS = VALUES(ADDRESS)`;
                    dbConn.query(query, function (error) {
                        if (error) {
                            console.log(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                        }
                    });
                } else { // UPDATE
                    console.log(CONSTANTS.MESSAGE.STARTED_UPDATEQUERY);
                    const query = `${CONSTANTS.QUERY.UPDATE.DAILYSLP} SET YESTERDAY = '${items.YESTERDAY}', TODAY = '${items.TODAY}', TODATE = '${items.TODATE}' WHERE ADDRESS = '${items.ADDRESS}'`;
                    dbConn.query(query, function (error) {
                        if (error) {
                            console.log(CONSTANTS.MESSAGE.ERROR_PROCEDURE, error);
                        }
                    });
                }
    
                return items;
            });

            // Return
            return await Promise.all(upsertProcedure).then(function (results) {
                console.log(CONSTANTS.MESSAGE.ENDPOST);
                // End DB Connection
                dbConn.end();
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
    console.log(`Server listening on ${PORT}`);
});