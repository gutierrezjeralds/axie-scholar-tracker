"use strict";

/**
 * Middleware file
 * Date Created: 2022/12/01
 * Objective: Middleware Index
 */

exports.appLogger = require("./logger");

exports.resolveMiddleware = function(name, req, res) {
	return new Promise((resolve, reject) => {
		if (exports[name]) {
			exports[name](req, res, (err) => {
				if (err) {
					return reject(err);
				}
				return resolve(req);
			});
		} else {
			reject(new Error("Invalid middleware"));
		}
	});
};