import {IConfig} from "./IConfig";
import {IRow} from "./IRow";

export interface IDatabaseHandler {
    connect();
    end();
    query(callback: (err, rows: Array<IRow>) => void);
}