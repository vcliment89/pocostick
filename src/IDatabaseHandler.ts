import {IConfig} from "./IConfig";

export interface IDatabaseHandler {
    connect();
    end();
    query(callback: (err, rows, fields) => void);
}