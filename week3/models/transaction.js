const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  charge: { type: String, required: true },
  userId: { type: String, required: true, index: true },
});

module.exports = mongoose.model("transactions", transactionSchema);
