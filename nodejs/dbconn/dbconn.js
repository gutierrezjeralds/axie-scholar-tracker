/**
 * Objective: DB Connection
 */

const { MongoClient } = require('mongodb');
// const connectionString = process.env.ATLAS_URI;
const connectionString = process.env.MONGODB_URI;
const client = new MongoClient(connectionString, {
    connectTimeoutMS: 12000,
    socketTimeoutMS: 12000,
    serverSelectionTimeoutMS: 12000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
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