const mongoose = require('mongoose');

const credentialSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        required: false
    },
    date: { 
      type: String, 
      required: true, 
    }
});

module.exports = mongoose.model('Credential', credentialSchema); 