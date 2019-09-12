"use strict";
const request = require("request");
module.exports = function req(url, options) {
    return new Promise(function (resolve, reject) {
        request(url, options, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else if (response.statusCode !== 200) {
                reject(new Error(`HTTP Error ${response.statusCode} ${response.statusMessage}`));
            }
            else {
                resolve(typeof body === 'string' ? body : '');
            }
        });
    });
};
//# sourceMappingURL=req.js.map