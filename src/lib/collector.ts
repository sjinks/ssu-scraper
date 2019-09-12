import cheerio = require('cheerio');
import req from './req';

function downloadPage(page: number): Promise<string> {
    const url = `https://ssu.gov.ua/ua/find/${page}/category/70`;
    return req(url, { method: 'GET' });
}

export = function gatherIds(): Promise<Set<number>> {
    return new Promise(async (resolve: (r: Set<number>) => void, reject: (e: Error) => void): Promise<void> => {
        const result = new Set<number>();
        let page = 1;
        let npages: number | undefined;

        do {
            let body: string;
            try {
                body = await downloadPage(page);
            } catch (e) {
                reject(e);
                return;
            }

            const $ = cheerio.load(body);

            let ids: number[] = $('.find_content .news_content_item_link a').map((index: number, el: CheerioElement): number => {
                const matches = $(el).attr('href').match(/\/view\/([0-9]+)$/);
                return matches ? parseInt(matches[1], 10) : 0;
            }).get().filter(Boolean);

            ids.forEach((id: number): void => { result.add(id); });

            if (typeof npages === 'undefined') {
                const href = $('.pages .pages_link:last-child a').attr('href');
                const matches = href.match(/\/ua\/find\/([0-9]+)\//);
                npages = matches ? parseInt(matches[1], 10) : 1;
            }

            ++page;
        } while (page <= npages);

        resolve(result);
    });
}
