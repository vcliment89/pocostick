import PocoStick from "./index";
import * as fs from "fs";

var stick = new PocoStick(require("../connection.json"), "./models/");

stick.generate();