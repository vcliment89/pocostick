"use strict";
var pluralize = require("pluralize");
var fs = require("fs");
var path = require("path");
var MysqlHandler_1 = require("./MysqlHandler");
var MssqlHandler_1 = require("./MssqlHandler");
var PocoFile_1 = require("./PocoFile");
var PocoStick = (function () {
    function PocoStick(config, defaultNamespace, logger) {
        if (defaultNamespace === void 0) { defaultNamespace = "PocoStick.Models"; }
        if (logger === void 0) { logger = function (message) { return console.log(message); }; }
        this.config = config;
        this.defaultNamespace = defaultNamespace;
        this.logger = logger;
        this.now = new Date();
        this.templateClass = fs.readFileSync(path.join(path.dirname(__filename), "poco.ts"), "utf8");
        this.templateProperty = [
            "\t\t/**",
            "\t\t * @name {{className}}#{{name}}",
            "\t\t * @type {{type}}{{nullable}}",
            "\t\t * @default {{defaultValue}}",
            "\t\t */",
            "\t\t{{name}}: {{type}};"
        ];
        this.tsTypes = {
            number: "number",
            string: "string",
            boolean: "boolean",
            date: "Date"
        };
        this.mysqlTypes = {
            // Numbers
            "int": this.tsTypes.number,
            "tinyint": this.tsTypes.number,
            "smallint": this.tsTypes.number,
            "mediumint": this.tsTypes.number,
            "bigint": this.tsTypes.number,
            "float": this.tsTypes.number,
            "double": this.tsTypes.number,
            "decimal": this.tsTypes.number,
            // Dates
            "date": this.tsTypes.date,
            "datetime": this.tsTypes.date,
            "timestamp": this.tsTypes.date,
            "time": this.tsTypes.date,
            "year": this.tsTypes.date,
            // Strings
            "char": this.tsTypes.string,
            "varchar": this.tsTypes.string,
            "nvarchar": this.tsTypes.string,
            "text": this.tsTypes.string,
            "tinytext": this.tsTypes.string,
            "mediumtext": this.tsTypes.string,
            "longtext": this.tsTypes.string,
            // Booleans
            "bit": this.tsTypes.boolean
        };
        this.mssqlTypes = {
            // Numbers
            "int": this.tsTypes.number,
            "tinyint": this.tsTypes.number,
            "smallint": this.tsTypes.number,
            "mediumint": this.tsTypes.number,
            "bigint": this.tsTypes.number,
            "float": this.tsTypes.number,
            "double": this.tsTypes.number,
            "decimal": this.tsTypes.number,
            // Dates
            "date": this.tsTypes.date,
            "datetime": this.tsTypes.date,
            "timestamp": this.tsTypes.date,
            "time": this.tsTypes.date,
            "year": this.tsTypes.date,
            // Strings
            "char": this.tsTypes.string,
            "varchar": this.tsTypes.string,
            "nvarchar": this.tsTypes.string,
            "text": this.tsTypes.string,
            "tinytext": this.tsTypes.string,
            "mediumtext": this.tsTypes.string,
            "longtext": this.tsTypes.string,
            // Booleans
            "bit": this.tsTypes.boolean
        };
        this.typeMap = {};
        switch (config.driver) {
            case "mysql":
                this.useMysql();
                break;
            case "mssql":
                this.useMssql();
                break;
            default:
                throw new Error("Unsupported driver");
        }
    }
    PocoStick.prototype.generate = function (completed, dryRun) {
        var _this = this;
        if (dryRun === void 0) { dryRun = false; }
        this.db.connect();
        try {
            this.db.query(function (err, rows) {
                if (err !== null) {
                    throw new Error(err.message);
                }
                var tableNames = rows
                    .map(function (row) { return row.tableName; })
                    .filter(function (val, pos, arr) { return arr.indexOf(val) === pos; });
                var files = tableNames.map(function (tableName) { return _this.createFile(rows, tableName); });
                if (!dryRun) {
                    files.forEach(function (file) {
                        try {
                            PocoStick.ensureDirectoryExistence(file.filename);
                            fs.writeFileSync(file.filename, file.content, "utf8");
                        }
                        catch (e) {
                            console.error(e);
                        }
                    });
                }
                _this.db.end();
                _this.logger("Finished");
                completed();
            });
        }
        catch (e) {
            console.error(e);
        }
    };
    PocoStick.prototype.ensureDirectoryExistence = function (filePath) {
      var dirname = path.dirname(filePath);
      if (fs.existsSync(dirname)) {
        return true;
      }
      PocoStick.ensureDirectoryExistence(dirname);
      fs.mkdirSync(dirname);
    };
    PocoStick.prototype.useMssql = function () {
        this.typeMap = this.mssqlTypes;
        this.db = new MssqlHandler_1.default(this.config);
    };
    PocoStick.prototype.useMysql = function () {
        this.typeMap = this.mysqlTypes;
        this.db = new MysqlHandler_1.default(this.config);
    };
    PocoStick.getProperName = function (tableName) {
        return pluralize.singular(tableName);
    };
    PocoStick.prototype.createFile = function (rows, tableName) {
        var fileName = PocoStick.getProperName(tableName) + ".ts";
        this.logger("Creating file '" + fileName + "'");
        return new PocoFile_1.default("" + this.config.output + fileName, this.createClass(rows, tableName));
    };
    PocoStick.prototype.createClass = function (rows, tableName) {
        var className = PocoStick.getProperName(tableName);
        this.logger("\tCreating class '" + className + "'");
        return this.templateClass
            .replace("POCOSTICK_DEFAULT_NAMESPACE", this.defaultNamespace)
            .replace("POCOSTICK_CLASS_NAME", className)
            .replace("{{now}}", this.now.toString())
            .replace("// POCOSTICK_PROPERTIES", this.createProperties(rows, tableName));
    };
    PocoStick.prototype.createProperties = function (rows, tableName) {
        var _this = this;
        var className = PocoStick.getProperName(tableName);
        this.logger("\t\tCreating properties for class '" + className + "'");
        return rows
            .filter(function (row) { return row.tableName === tableName; })
            .map(function (field) { return _this.createProperty(field, className); })
            .join("\r\n");
    };
    PocoStick.prototype.createProperty = function (row, className) {
        var name = PocoStick.getProperName(row.name);
        var type = this.typeMap[row.type];
        var isNullable = row.isNullable;
        this.logger("\t\tCreating property '" + name + "' of type '" + type + "' that " + (isNullable ? "IS" : "is not") + " nullable.");
        return this.templateProperty.map(function (line) {
            if (line.match("{{defaultValue}}") && row.defaultValue === null) {
                return null;
            }
            return line
                .replace("{{name}}", name)
                .replace("{{type}}", type)
                .replace("{{className}}", className)
                .replace("{{nullable}}", isNullable ? "?" : "")
                .replace("{{defaultValue}}", row.defaultValue !== null ? row.defaultValue : "");
        }).filter(function (line) { return line !== null; }).join("\r\n");
    };
    return PocoStick;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PocoStick;
//# sourceMappingURL=index.js.map
