import {IDatabaseHandler} from "./IDatabaseHandler";
import {IConfig} from "./IConfig";
import {IRow} from "./IRow";
import {IRowDataPacket} from "./IRowDataPacket";

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
                .then((recordSet: Array<IRowDataPacket>) => callback(null, recordSet.map(row => {
                    return {
                        tableName: row.TABLE_NAME,
                        name: row.COLUMN_NAME,
                        defaultValue: row.COLUMN_DEFAULT,
                        isNullable: row.IS_NULLABLE === "YES",
                        type: row.DATA_TYPE
                    };
                })))
                .catch(err => callback(err, null)))
            .catch(err => callback(err, null));
    }
}