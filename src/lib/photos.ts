import request = require('request');
import fs = require('fs');
import { Criminal } from './criminals';
import pLimit = require('p-limit');

function savePhoto(id: number, url: string): Promise<void> {
    return new Promise((resolve: () => void, reject: (e: Error) => void): void => {
        request(url)
            .on('response', (resp): void => {
                if (resp.statusCode === 200) {
                    resp
                        .on('end', (): void => resolve())
                        .pipe(fs.createWriteStream(`${process.cwd()}/photos/${id}.jpg`))
                    ;
                } else {
                    reject(new Error(`HTTP Error ${resp.statusCode} ${resp.statusMessage}`));
                }
            })
            .on('error', (e: Error): void => {
                reject(e);
            })
        ;
    });
}

export function savePhotos(c: Criminal[]): Promise<void[]> {
    const promises: Promise<void>[] = [];
    const limit = pLimit.default(3);

    for (const item of c) {
        if (item.photo !== null) {
            promises.push(limit((): Promise<void> => savePhoto(item.id, item.photo as string)));
        }
    }

    return Promise.all(promises);
}
