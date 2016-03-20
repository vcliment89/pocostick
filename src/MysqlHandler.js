"use strict";
var mysql = require("mysql");
var MysqlHandler = (function () {
    function MysqlHandler(config) {
        this.config = config;
        this.connection = mysql.createConnection(this.config);
    }
    MysqlHandler.prototype.connect = function () {
        this.connection.connect();
    };
    MysqlHandler.prototype.end = function () {
        this.connection.end();
    };
    MysqlHandler.prototype.query = function (callback) {
        var sql = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + this.config.database + "'";
        this.connection.query(sql, function (e, r, f) { return callback(e, r); });
    };
    return MysqlHandler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MysqlHandler;
//# sourceMappingURL=MysqlHandler.js.map