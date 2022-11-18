/**
 * Objective: DB Connection
 */

const { MongoClient } = require('mongodb');
// const connectionString = process.env.ATLAS_URI;
const connectionString = process.env.MONGODB_URI;
const client = new MongoClient(connectionString, {
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
            console.log("Successfully connected to MongoDB!");

            return callback();
        });
    },

    getDb: function () {
        return dbConnection;
    }
};