const mongoose = require("mongoose");
const User = require("./User");

mongoose.connect("mongodb://localhost/testdb");

new User({ name: "latesh", age: 20 });
