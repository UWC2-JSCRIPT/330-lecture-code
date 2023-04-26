const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  charge: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, index: true }
});

module.exports = mongoose.model("transactions", transactionSchema);