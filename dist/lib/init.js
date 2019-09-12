"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("util");
const fs = require("fs");
function init(db) {
    const mkdir = util.promisify(fs.mkdir);
    const exists = util.promisify(fs.exists);
    return new Promise(async (resolve, reject) => {
        const dir = path.join(process.cwd(), 'photos');
        try {
            let f = await exists(dir);
            if (!f) {
                await mkdir(dir, 0o755);
            }
            db.exec(`DROP TABLE IF EXISTS ssu`);
            db.exec(`CREATE TABLE ssu (
                id bigint not null primary key,
                surname varchar(255) not null,
                name varchar(255) not null,
                patronymic varchar(255) not null,
                dob date not null,
                sex varchar(255) not null,
                ddate date null,
                dplace varchar(255) not null,
                deterrence varchar(255) not null,
                article varchar(255) not null,
                contact varchar(255) not null
            )`);
            resolve();
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.init = init;
//# sourceMappingURL=init.js.map