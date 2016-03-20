# Pocostick

I though it was really annoying to write poco class in Typescript, so i made up a small library for that.

It simply connects to your database, reads your tables and columns, and generates classes for you, that can be used later.

The library is intended to be used with Typescript... But should easily integrate with a gulp for instance.

### Supported drivers
- mssql
- mysql

## Typescript example

```typecript
import Pocostick from "pocostick";

new Pocostick({
    host: "localhost",
    user: "pocostick",
    password: "pocostick",
    database: "pocostick",
    driver: "mysql",
    output: "./models/"
}).generate(() => process.exit(0));
```

## Javascript example

```javasccript
var Pocostick = require("pocostick");

new Pocostick.default({
    host: "localhost",
    user: "pocostick",
    password: "pocostick",
    database: "pocostick",
    driver: "mysql",
    output: "./models/"
}).generate(function () {
    process.exit(0);
});
```