"use strict";

/**
 * Middleware file
 * Date Created: 2022/12/09
 * Objective: Middleware for Logger
 */

// Dependencies
const { LOGTAILHEROKU, LOGTAILVERCEL, MESSAGE } = require("../../client/src/components/Constants");
const { Logtail } = require("@logtail/node");
const logger = {
    info: (function () {}),
    error: (function () {}),
    warn: (function () {}),
    logtail: {
        heroku: new Logtail(LOGTAILHEROKU),
        vercel: new Logtail(LOGTAILVERCEL)
    }
};

// Create middleware
const middleware = async(req, res, next) => {
    try {
        // Setting up the initialization of Logtail
        const DOMAIN = (req.hostname).split(".")[1] ? (req.hostname).split(".")[1] : false;
        let LOGTAIL = false;
        if (DOMAIN === "herokuapp") {
            LOGTAIL = logger.logtail.heroku;
        } else if (DOMAIN === "vercel") {
            LOGTAIL = logger.logtail.vercel;
        }

        // Set log console
        const LOGLEVEL = ["info", "error", "warn"];
        LOGLEVEL.map((data) => {
            if (LOGTAIL) {
                logger[data] = function(msg, subMsg = "", addedMsg = "") {
                    subMsg = typeof subMsg === "string" ? subMsg : JSON.stringify(subMsg);
                    addedMsg = typeof addedMsg === "string" ? addedMsg : JSON.stringify(addedMsg);
                    const message = msg + " " + subMsg + " " + addedMsg;
                    LOGTAIL[data](message);
                };
            } else {
                logger[data] = function(msg, subMsg = "", addedMsg = "") {
                    console[data](new Date(), msg, subMsg, addedMsg);
                };
            }
        });
    } catch (err) {
        console.error(MESSAGE.MIDWARE_LOGGER, err);
    }

	req.logger = logger;
	return next();
};

module.exports = async (app) => {
    app.use(middleware);
};