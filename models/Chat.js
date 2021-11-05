const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create student schema & model
const ChatSchema = new Schema({
    room_name: {
        type: String,
    },
    value:{
        type: String,
    },
    user:{
        type: String
    }
});

const Chat = mongoose.model('chat',ChatSchema);

module.exports = Chat;