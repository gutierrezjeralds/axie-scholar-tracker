const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { TABLES } = require("../../client/src/components/Constants");

// TB_USERPROFILE
const userProfileSchema = new Schema({
    ADDRESS: { type: String, required: true },
    NAME: { type: String, required: true },
    EMAIL: { type: String, required: true },
    PASS: { type: String, required: true },
    SHR_MANAGER: { type: String, required: true },
    SHR_SCHOLAR: { type: String, required: true },
    SHR_SPONSOR: { type: String, required: true },
    SPONSOR_NAME: { type: String },
    STARTED_ON: { type: Date, default: Date.now, required: true },
    DELETEIND: { type: String }
}, {collection: TABLES.TBUSERPROFILE});

// TB_WITHDRAW
const withdrawSchema = new Schema({
    ADDRESS: { type: String, required: true },
    SLPTOTAL: { type: String, required: true },
    SLPCURRENCY: { type: String, required: true },
    WITHDRAW_ON: { type: Date, default: Date.now, required: true }
}, {collection: TABLES.TBWITHDRAW});

// TB_MANAGEREARNED
const managerEranedSchema = new Schema({
    SLPTOTAL: { type: String, required: true },
    SLPCURRENCY: { type: String, required: true },
    CATEGORY: { type: String, required: true },
    EARNED_ON: { type: Date, default: Date.now, required: true }
}, {collection: TABLES.TBMANAGEREARNED});

const TBUSERPROFILE = model(TABLES.TBUSERPROFILE, userProfileSchema);
const TBWITHDRAW = model(TABLES.TBWITHDRAW, withdrawSchema);
const TBMANAGEREARNED = model(TABLES.TBMANAGEREARNED, managerEranedSchema);

module.exports = {
    TBUSERPROFILE,
    TBWITHDRAW,
    TBMANAGEREARNED
};