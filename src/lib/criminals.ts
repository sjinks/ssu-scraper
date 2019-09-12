import cheerio = require('cheerio');
import voca = require('voca');
import req from './req';

export interface Criminal {
    id: number;
    surname: string;
    name: string;
    patronymic: string;
    dob: string;
    sex: string;
    ddate: string|null;
    dplace: string;
    deterrence: string;
    article: string;
    contact: string;
    photo: string|null;

    [s: string]: number|string|null;
}

const map: Record<string, string> = {
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

function downloadDetails(id: number): Promise<string> {
    const url = `https://ssu.gov.ua/ua/find/1/category/70/view/${id}`;
    return req(url, { method: 'GET' });
}

function parsePhoto(src: string): string | null {
    if (src && !src.endsWith('nophoto.png')) {
        if (src.startsWith('/')) {
            src = 'https://ssu.gov.ua' + src.replace('/thumb/', '/');
        }

        return src;
    }

    return null;
}

function parseName(s: string): string {
    s = normalizeWhitespace(s).replace(/’/g, "'");
    return voca
        .titleCase(s)
        .replace(/'(\p{Lu})/ug, (m: string): string => m[0] + m[1].toLowerCase())
    ;
}

function normalizeWhitespace(s: string): string {
    return s.replace(/\p{White_Space}+/ug, ' ');
}

function parseSex(s: string): string {
    switch (s.toLowerCase()) {
        case 'чоловіча': return 'M';
        case 'жіноча': return 'F';
        default: return s;
    }
}

function parseDOB(s: string): string {
    const lut: Record<string, string> = {
        'січня': '01', 'лютого': '02', 'березня': '03', 'квітня': '04',
        'травня': '05', 'червня': '06', 'липня': '07', 'серпня': '08',
        'вересня': '09', 'жовтня': '10', 'листопада': '11', 'грудня': '12'
    };

    s = s.toLowerCase();
    const matches = s.match(/([0-9]{1,2})\s+(\S+)\s+([0-9]{4})/);
    if (matches) {
        const day = matches[1].padStart(2, '0');
        const month: string | undefined = lut[matches[2]];
        const year = matches[3];

        if (day && month && year) {
            return `${year}-${month}-${day}`;
        }
    }

    return '0000-00-00';
}

function parseDDate(s: string): string | null {
    return s === '0000-00-00 00:00:00' ? null : s;
}

function postprocessCriminal(c: Criminal): Criminal {
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

function processCriminal(id: number): Promise<Criminal> {
    return new Promise(async (resolve: (r: Criminal) => void, reject: (e: Error) => void) => {
        let body: string;
        try {
            body = await downloadDetails(id);
        } catch (e) {
            reject(e);
            return;
        }

        const $ = cheerio.load(body);
        const result: Criminal = {
            id,
            surname: '', name: '', patronymic: '', dob: '', sex: '',
            ddate: '', dplace: '',
            deterrence: '', article: '',
            contact: '',
            photo: null
        };

        $('.find_content .find_content_line').each((index: number, element: CheerioElement): void => {
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

export async function processCriminals(ids: Set<number>): Promise<Criminal[]> {
    const result: Criminal[] = [];
    for (const id of ids) {
        result.push(await processCriminal(id));
    }

    return result;
}
