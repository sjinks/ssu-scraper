export interface Criminal {
    id: number;
    surname: string;
    name: string;
    patronymic: string;
    dob: string;
    sex: string;
    ddate: string | null;
    dplace: string;
    deterrence: string;
    article: string;
    contact: string;
    photo: string | null;
    [s: string]: number | string | null;
}
export declare function processCriminals(ids: Set<number>): Promise<Criminal[]>;
