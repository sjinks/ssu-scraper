"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const voca = require("voca");
const req_1 = __importDefault(require("./req"));
const map = {
    'Прізвище': 'surname',
    'Ім`я': 'name',
    'По батькові': 'patronymic',
    'Дата народження': 'dob',
    'Стать': 'sex',
    'Дата зникнення': 'ddate',
    'Місце зникнення': 'dplace',
    'Запобіжний захід': 'deterrence',
    'Стаття звинувачення': 'article',
    'Контактна інформація': 'contact'
};
function downloadDetails(id) {
    const url = `https://ssu.gov.ua/ua/find/1/category/70/view/${id}`;
    return req_1.default(url, { method: 'GET' });
}
function parsePhoto(src) {
    if (src && !src.endsWith('nophoto.png')) {
        if (src.startsWith('/')) {
            src = 'https://ssu.gov.ua' + src.replace('/thumb/', '/');
        }
        return src;
    }
    return null;
}
function parseName(s) {
    s = normalizeWhitespace(s).replace(/’/g, "'");
    return voca
        .titleCase(s)
        .replace(/'(\p{Lu})/ug, (m) => m[0] + m[1].toLowerCase());
}
function normalizeWhitespace(s) {
    return s.replace(/\p{White_Space}+/ug, ' ');
}
function parseSex(s) {
    switch (s.toLowerCase()) {
        case 'чоловіча': return 'M';
        case 'жіноча': return 'F';
        default: return s;
    }
}
function parseDOB(s) {
    const lut = {
        'січня': '01', 'лютого': '02', 'березня': '03', 'квітня': '04',
        'травня': '05', 'червня': '06', 'липня': '07', 'серпня': '08',
        'вересня': '09', 'жовтня': '10', 'листопада': '11', 'грудня': '12'
    };
    s = s.toLowerCase();
    const matches = s.match(/([0-9]{1,2})\s+(\S+)\s+([0-9]{4})/);
    if (matches) {
        const day = matches[1].padStart(2, '0');
        const month = lut[matches[2]];
        const year = matches[3];
        if (day && month && year) {
            return `${year}-${month}-${day}`;
        }
    }
    return '0000-00-00';
}
function parseDDate(s) {
    return s === '0000-00-00 00:00:00' ? null : s;
}
function postprocessCriminal(c) {
    c.surname = parseName(c.surname);
    c.name = parseName(c.name);
    c.patronymic = parseName(c.patronymic);
    c.dob = parseDOB(c.dob);
    c.sex = parseSex(c.sex);
    c.ddate = parseDDate(c.ddate || '');
    c.deterrence = normalizeWhitespace(c.deterrence).toLowerCase();
    c.article = normalizeWhitespace(c.article);
    c.contact = normalizeWhitespace(c.contact);
    c.photo = parsePhoto(c.photo || '');
    return c;
}
function processCriminal(id) {
    return new Promise(async (resolve, reject) => {
        let body;
        try {
            body = await downloadDetails(id);
        }
        catch (e) {
            reject(e);
            return;
        }
        const $ = cheerio.load(body);
        const result = {
            id,
            surname: '', name: '', patronymic: '', dob: '', sex: '',
            ddate: '', dplace: '',
            deterrence: '', article: '',
            contact: '',
            photo: null
        };
        $('.find_content .find_content_line').each((index, element) => {
            let n = $(element).find('.find_content_line_text').text().trim();
            if (n in map) {
                const field = map[n];
                result[field] = $(element).find('.find_content_line_content').text().trim();
            }
        });
        result.photo = $('.find_img_holder img').attr('src');
        resolve(postprocessCriminal(result));
    });
}
async function processCriminals(ids) {
    const result = [];
    for (const id of ids) {
        result.push(await processCriminal(id));
    }
    return result;
}
exports.processCriminals = processCriminals;
//# sourceMappingURL=criminals.js.map