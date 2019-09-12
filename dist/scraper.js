"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Db = require("better-sqlite3");
const init_1 = require("./lib/init");
const collector_1 = __importDefault(require("./lib/collector"));
const criminals_1 = require("./lib/criminals");
const photos_1 = require("./lib/photos");
const db = new Db(path_1.default.join(__dirname, 'ssu.sqlite'));
function saveCriminals(c) {
    const insertCriminal = db.prepare(`INSERT INTO ssu
        (id, surname, name, patronymic, dob, sex, article, deterrence, dplace, ddate, contact) VALUES
        (:id, :surname, :name, :patronymic, :dob, :sex, :article, :deterrence, :dplace, :ddate, :contact)`);
    db.transaction(() => {
        for (const item of c) {
            const { photo } = item, data = __rest(item, ["photo"]);
            insertCriminal.run(data);
        }
    })();
}
init_1.init(db)
    .then(() => collector_1.default())
    .then((ids) => criminals_1.processCriminals(ids))
    .then((c) => {
    saveCriminals(c);
    return photos_1.savePhotos(c);
})
    .catch((e) => console.error(e));
;
//# sourceMappingURL=scraper.js.map