export interface IConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    driver: "mysql" | "mssql";
}