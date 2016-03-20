import PocoStick from "./index";

new PocoStick({
    host: "localhost",
    user: "pocostick",
    password: "pocostick",
    database: "pocostick",
    driver: "mysql",
    output: "./models/"
}).generate(() => process.exit(0));