const mongoose = require("mongoose");

const todoModel = new mongoose.Schema({
  taskDescription: String,
  pic: String,
  isCompleted: { type: Boolean, default: false },
  task_id: Number,
});
const Todo = mongoose.model("Todo", todoModel);
module.exports = Todo;
