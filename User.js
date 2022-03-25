const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

userSchema.statics.findByName = function (name) {
  return this.where({ name: new RegExp(name, "i") });
};

module.exports = mongoose.model("User", userSchema);
