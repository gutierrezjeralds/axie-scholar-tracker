/**
 * Objective: DB Connection
 */

const { MongoClient } = require('mongodb');
const { MESSAGE } = require("../../client/src/components/Constants");
// const connectionString = process.env.ATLAS_URI;
const connectionString = process.env.MONGODB_URI;

// Connection for MongoDB
const client = new MongoClient(connectionString, { // MongoDB
    useNewUrlParser: true, // Avoid deprecation warning
    useUnifiedTopology: true, // Avoid deprecation warning
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 300000 // Close sockets after 5 minutes of inactivity
});

let dbConnection;

module.exports = {
    connectToServer: function (callback) {
        client.connect(function (err, db) {
            if (err || !db) {
                return callback(err);
            }

            dbConnection = db.db("LOKIDB");
            console.log(MESSAGE.SUCESSCON_MONGODB);
        });
    
        return callback();
    },

    getDb: function () {
        return dbConnection;
    }
};