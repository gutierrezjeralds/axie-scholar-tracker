/*eslint no-console: 0*/
"use strict";

/**
 * Date Created: 11/17/2022
 * Objective: API Server
 */


// Loads the configuration from .env to process.env
require('dotenv').config({ path: '../.env' });

// Dependencies
const PORT = process.env.PORT || 3001;
const path = require('path');
const express = require("express");
const cors = require("cors");
const dbConn = require('./dbconn/dbconn');

/**
 * API container (to be export)
 */
const app = express();
app.use(express.json());
app.use(cors());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

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

// Perform a database connection when the server starts
dbConn.connectToServer(function (err) {
    if (err) {
        console.error(err);
        process.exit();
    }
  
    // start the Express server
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
});

// Export the API container
module.exports = app;