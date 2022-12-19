const mongoose = require("mongoose");
const { MESSAGE } = require("../../client/src/components/Constants");

// const connectionString = process.env.ATLAS_URI;
const connectionString = process.env.MONGODB_URI;

// Connection for MongooseDB
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(connectionString, {
            // useUnifiedTopology: true,
            // useNewUrlParserL: true
        });
    } catch (err) {
        console.log(MESSAGE.CONNECTIONDB_ERROR, err);
    }
}

module.exports = connectDB