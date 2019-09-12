"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const cheerio = require("cheerio");
const req_1 = __importDefault(require("./req"));
function downloadPage(page) {
    const url = `https://ssu.gov.ua/ua/find/${page}/category/70`;
    return req_1.default(url, { method: 'GET' });
}
module.exports = function gatherIds() {
    return new Promise(async (resolve, reject) => {
        const result = new Set();
        let page = 1;
        let npages;
        do {
            let body;
            try {
                body = await downloadPage(page);
            }
            catch (e) {
                reject(e);
                return;
            }
            const $ = cheerio.load(body);
            let ids = $('.find_content .news_content_item_link a').map((index, el) => {
                const matches = $(el).attr('href').match(/\/view\/([0-9]+)$/);
                return matches ? parseInt(matches[1], 10) : 0;
            }).get().filter(Boolean);
            ids.forEach((id) => { result.add(id); });
            if (typeof npages === 'undefined') {
                const href = $('.pages .pages_link:last-child a').attr('href');
                const matches = href.match(/\/ua\/find\/([0-9]+)\//);
                npages = matches ? parseInt(matches[1], 10) : 1;
            }
            ++page;
        } while (page <= npages);
        resolve(result);
    });
};
//# sourceMappingURL=collector.js.map