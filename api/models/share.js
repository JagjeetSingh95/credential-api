const mongoose = require('mongoose');

const shareSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    credential: { type: mongoose.Schema.Types.ObjectId, ref: 'Credential', required: true },
    sharedBy: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Share', shareSchema); 