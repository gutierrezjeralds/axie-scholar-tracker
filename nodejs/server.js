/*eslint no-console: 0*/
"use strict";

/**
 * Date Created: 11/17/2022
 * Objective: API Server
 */


// Loads the configuration from .env to process.env
require('dotenv').config();

// Dependencies
const PORT = process.env.PORT || 3001;
const path = require('path');
const express = require("express");
const cors = require("cors");
const { APIURI, LOGTAILHEROKU, LOGTAILVERCEL, MESSAGE } = require("../client/src/components/Constants");
const { Logtail } = require("@logtail/node");
const logtailHeroku = new Logtail(LOGTAILHEROKU);
const logtailVercel = new Logtail(LOGTAILVERCEL);
const {
	appLogger
} = require("./middlewares");

/**
 * API container (to be export)
 */
const app = express();
app.use(express.json());
app.use(cors());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Initialized Middlewares
appLogger(app);

/**
 * Static index page
 */
// app.get("/", function (req, res) {
// 	res.setHeader("Content-type", "application/json");
// 	res.end(JSON.stringify({
// 		"message": "Welcome to Node API"
// 	}));
// });

/**
 * Address the Client side
 */
app.get('/', (req,res)=>{
    res.sendFile(path.resolve(__dirname,'client','build','index.html'))
})

/**
 * Collection of routes.
 */
// MongoDB
var mongoDb = require("./routers/MongoDb");
app.use("/mongodb/api", mongoDb);

// Mongoose
var mongoose = require("./routers/Mongoose");
app.use("/mongoose/api", mongoose);

// Heroku
var heroku = require("./routers/heroku");
app.use("/heroku/api", heroku);

// DB4Free.net
var dbfree = require("./routers/dbfree");
app.use("/db4free/api", dbfree);

/**
 * Global error handling
 */
// app.use(function (err, _req, res) {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

if (APIURI.indexOf('mongodb') > -1) {
    // Connect MongoDB
    const dbConn = require('./dbconn/Mongo');
    // Perform a database connection when the server starts
    dbConn.connectToServer(function (err) {
        if (err) {
            console.error(err);
            logtailHeroku.error(err);
            logtailVercel.error(err);
            process.exit();
        } else {
            // Start the Express server
            app.listen(PORT, () => {
                console.log(MESSAGE.SERVER_ISRUNNING_PORT, PORT);
                console.log(MESSAGE.SERVER_ISRUNNING_URI, APIURI);
            });
        }
    });
} else if (APIURI.indexOf('mongoose') > -1) {
    // Connect Mongoose
    const mongooseDB = require("mongoose");
    const connectDB = require('./dbconn/Mongoose');
    connectDB();
    // Perform a database connection when the server starts
    mongooseDB.connection.on("error", console.error.bind(console, MESSAGE.CONNECTIONDB_ERROR));
    mongooseDB.connection.once("open", function () {
        console.log(MESSAGE.SUCESSCON_MONGOOSEDB);
        // Start the Express server
        app.listen(PORT, () => {
            console.log(MESSAGE.SERVER_ISRUNNING_PORT, PORT);
            console.log(MESSAGE.SERVER_ISRUNNING_URI, APIURI);
        });
    });
} else {
    // No Database connection x Start the Express server
    app.listen(PORT, () => {
        console.log(MESSAGE.NO_CONNECTIONDB);
        console.log(MESSAGE.SERVER_ISRUNNING_PORT, PORT);
        console.log(MESSAGE.SERVER_ISRUNNING_URI, APIURI);
    });
}

// Export the API container
module.exports = app;