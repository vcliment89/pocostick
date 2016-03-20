import PocoStick from "./index";
import * as fs from "fs";

new PocoStick({
    "host": "localhost",
    "user": "pocostick",
    "password": "pocostick",
    "database": "pocostick",
    "driver": "mysql"
}, "./models/").generate(() => process.exit(0));