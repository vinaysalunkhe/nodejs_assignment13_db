const mongoose = require("mongoose");

module.exports.init = async function () {
  await mongoose.connect(
    "mongodb+srv://vinaysalunkhe1006:vinay@cluster0.qnk6hnw.mongodb.net/todo?retryWrites=true&w=majority"
  );
};
