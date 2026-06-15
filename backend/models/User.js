const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4(), // e.g., "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
