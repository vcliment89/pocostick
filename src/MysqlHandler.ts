import {IDatabaseHandler} from "./IDatabaseHandler";
import * as mysql from "mysql";
import {IConfig} from "./IConfig";
import {IRow} from "./IRow";

interface IFieldPacket {
    catalog: string;
    charsetNr: number;
    db: string;
    decimals: number;
    default: any;
    flags: number;
    length: number;
    name: string;
    orgName: string;
    protocol41: boolean;
    table: string;
    type: number;
    zeroFill: boolean;
}

interface IRowDataPacket {
    TABLE_CATALOG: string;
    TABLE_SCHEMA: string;
    TABLE_NAME: string;
    COLUMN_NAME: string;
    ORDINAL_POSITION: number;
    COLUMN_DEFAULT: any;
    IS_NULLABLE: "YES" | "NO";
    DATA_TYPE: string;
    CHARACTER_MAXIMUM_LENGTH: number;
    CHARACTER_OCTET_LENGTH: number;
    NUMERIC_PRECISION?: number;
    NUMERIC_SCALE?: number;
    DATETIME_PRECISION?: number;
    CHARACTER_SET_NAME: string;
    COLLATION_NAME: string;
    COLUMN_TYPE: string;
    COLUMN_KEY: string;
    EXTRA: string;
    PRIVILEGES: string;
    COLUMN_COMMENT: string;
    GENERATION_EXPRESSION: string;
}

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

        this.connection.query(sql, (e, r: Array<IRowDataPacket>, f: Array<IFieldPacket>) => callback(e, r));
    }
}