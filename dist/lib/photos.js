"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const fs = require("fs");
const pLimit = require("p-limit");
function savePhoto(id, url) {
    return new Promise((resolve, reject) => {
        request(url)
            .on('response', (resp) => {
            if (resp.statusCode === 200) {
                resp
                    .on('end', () => resolve())
                    .pipe(fs.createWriteStream(`${process.cwd()}/photos/${id}.jpg`));
            }
            else {
                reject(new Error(`HTTP Error ${resp.statusCode} ${resp.statusMessage}`));
            }
        })
            .on('error', (e) => {
            reject(e);
        });
    });
}
function savePhotos(c) {
    const promises = [];
    const limit = pLimit.default(3);
    for (const item of c) {
        if (item.photo !== null) {
            promises.push(limit(() => savePhoto(item.id, item.photo)));
        }
    }
    return Promise.all(promises);
}
exports.savePhotos = savePhotos;
//# sourceMappingURL=photos.js.map