"use strict";
var mssql = require("mssql");
var MssqlHandler = (function () {
    function MssqlHandler(config) {
        this.config = config;
    }
    MssqlHandler.prototype.connect = function () {
    };
    MssqlHandler.prototype.end = function () {
    };
    MssqlHandler.prototype.query = function (callback) {
        var connectionString = "mssql://" + this.config.user + ":" + this.config.password + "@" + this.config.host + "/" + this.config.database;
        var sql = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = '" + this.config.database + "'";
        mssql.connect(connectionString)
            .then(function () { return new mssql.Request().query(sql)
            .then(function (recordSet) { return callback(null, recordSet); })
            .catch(function (err) { return callback(err, null); }); })
            .catch(function (err) { return callback(err, null); });
    };
    return MssqlHandler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MssqlHandler;
//# sourceMappingURL=MssqlHandler.js.map