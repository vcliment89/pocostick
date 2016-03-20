import {IDatabaseHandler} from "./IDatabaseHandler";
import * as mysql from "mysql";
import {IConfig} from "./IConfig";
import {IRow} from "./IRow";
import {IRowDataPacket} from "./IRowDataPacket";
import {IFieldPacket} from "./IFieldPacket";

export default class MysqlHandler implements IDatabaseHandler {
    private connection = mysql.createConnection(this.config);

    constructor(public config: IConfig) {}

    connect() {
        this.connection.connect();
    }

    end() {
        this.connection.end();
    }

    query(callback: (err: any, rows: Array<IRow>) => void) {
        var sql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${this.config.database}'`;

        this.connection.query(sql, (e, r: Array<IRowDataPacket>, f: Array<IFieldPacket>) => callback(e, r.map(row => {
            return {
                tableName: row.TABLE_NAME,
                name: row.COLUMN_NAME,
                defaultValue: row.COLUMN_DEFAULT,
                isNullable: row.IS_NULLABLE === "YES",
                type: row.DATA_TYPE
            };
        })));
    }
}