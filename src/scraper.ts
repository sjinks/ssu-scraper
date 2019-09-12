import path from 'path';
import Db = require('better-sqlite3');
import { init } from './lib/init';
import gatherIds from './lib/collector';
import { Criminal, processCriminals } from './lib/criminals';
import { savePhotos } from './lib/photos';

const db = new Db(path.join(__dirname, 'ssu.sqlite'));

function saveCriminals(c: Criminal[]): void {
    const insertCriminal = db.prepare(`INSERT INTO ssu
        (id, surname, name, patronymic, dob, sex, article, deterrence, dplace, ddate, contact) VALUES
        (:id, :surname, :name, :patronymic, :dob, :sex, :article, :deterrence, :dplace, :ddate, :contact)`
    );

    db.transaction((): void => {
        for (const item of c) {
            const { photo, ...data } = item;
            insertCriminal.run(data);
        }
    })();
}

init(db)
    .then((): Promise<Set<number>> => gatherIds())
    .then((ids: Set<number>): Promise<Criminal[]> => processCriminals(ids))
    .then((c: Criminal[]): Promise<void[]> => {
        saveCriminals(c);
        return savePhotos(c);
    })
    .catch((e: Error): void => console.error(e));
;
