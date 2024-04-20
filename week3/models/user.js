const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  settings: {
    useDarkMode: Boolean,
    language: String,
  },
  contact: {
    email: String,
  },
});

userSchema.index({ name: "text", "contact.email": "text" });

module.exports = mongoose.model("users", userSchema);
