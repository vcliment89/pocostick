type YesOrNo = "YES" | "NO";

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
    IS_NULLABLE: YesOrNo;
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

import * as mysql from "mysql";
import * as fs from "fs";
import * as pluralize from "pluralize";

var connectionConfig: mysql.IConnectionConfig = require("../connection.json");
var templateClass = fs.readFileSync("./src/poco.tmpl", "utf8");
var templateProperty = "\t\t{{name}}{{nullable}}: {{type}};"
var defaultNamespace = "DefaultNamespace";

var tsTypes = {
    number: "number",
    string: "string",
    boolean: "boolean",
    date: "Date"
};
var mysqlTypes = {
    // Numbers
    "int": tsTypes.number,
    "tinyint": tsTypes.number,
    "smallint": tsTypes.number,
    "mediumint": tsTypes.number,
    "bigint": tsTypes.number,
    "float": tsTypes.number,
    "double": tsTypes.number,
    "decimal": tsTypes.number,

    // Dates
    "date": tsTypes.date,
    "datetime": tsTypes.date,
    "timestamp": tsTypes.date,
    "time": tsTypes.date,
    "year": tsTypes.date,

    // Strings
    "char": tsTypes.string,
    "varchar": tsTypes.string,
    "text": tsTypes.string,
    "tinytext": tsTypes.string,
    "mediumtext": tsTypes.string,
    "longtext": tsTypes.string,

    // Booleans
    "bit": tsTypes.boolean
};

function getProperName(tableName: string) {
    return pluralize.singular(`${tableName.substr(0, 1).toUpperCase()}${tableName.substr(1)}`);
}

var connection = mysql.createConnection(connectionConfig);

connection.connect();

var sql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${connectionConfig.database}'`;

connection.query(sql, (err, rows: Array<IRowDataPacket>, fields: Array<IFieldPacket>) => {
    if (err) throw err;

    var tableNames = rows.map(row => row.TABLE_NAME).filter((val, pos, arr) => arr.indexOf(val) === pos);

    tableNames
        .forEach(tableName => fs.writeFileSync(`./models/${getProperName(tableName)}.ts`, templateClass
            .replace("{{namespace}}", defaultNamespace)
            .replace("{{name}}", getProperName(tableName))
            .replace("{{properties}}", rows
                .filter(row => row.TABLE_NAME === tableName)
                .map(field => templateProperty
                    .replace("{{name}}", field.COLUMN_NAME)
                    .replace("{{type}}", mysqlTypes[field.DATA_TYPE])
                    .replace("{{nullable}}", field.IS_NULLABLE === "YES" ? "?" : ""))
                .join("\r\n")), "utf8"));
});

connection.end();