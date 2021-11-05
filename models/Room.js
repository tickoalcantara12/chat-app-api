const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create student schema & model
const RoomSchema = new Schema({
    room_name: {
        type: String,
    },
});

const Room = mongoose.model('room',RoomSchema);

module.exports = Room;