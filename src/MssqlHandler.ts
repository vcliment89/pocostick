import {IDatabaseHandler} from "./IDatabaseHandler";
import {IConfig} from "./IConfig";
import {IRow} from "./IRow";

let mssql = require("mssql");

export default class MssqlHandler implements IDatabaseHandler {
    constructor(public config: IConfig) {}

    connect() {
    }

    end() {
    }

    query(callback:(err, rows: Array<IRow>) => void) {
        var connectionString = `mssql://${this.config.user}:${this.config.password}@${this.config.host}/${this.config.database}`;
        var sql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = '${this.config.database}'`;
        
        mssql.connect(connectionString)
            .then(() => new mssql.Request().query(sql)
                .then(recordSet => callback(null, recordSet))
                .catch(err => callback(err, null)))
            .catch(err => callback(err, null));
    }

}