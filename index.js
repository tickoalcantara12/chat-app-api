const app = require("express")();
const cors = require('cors')
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const bodyParser = require("body-parser");
const {joinUser, removeUser, findUser} = require('./users');
const Room = require('./models/Room')
const Chat = require('./models/Chat')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017');
mongoose.Promise = global.Promise;

app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE']
    }
))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/create-room", function (req, res, next) {
    Room.create(req.body).then(data=>{
        res.send({status_code:200, message:"Save data success", data:data})
    }).catch(next)
})

app.get('/rooms', function (req, res, next) {
    Room.find({}).then(data=>{
        res.send({status_code:200, message:"Get data.", data:data})
    }).catch(next)
})

app.delete('/rooms/:id', function (req, res, next){
    Room.findByIdAndDelete(req.params.id).then(()=>{
        res.send({status_code:200, message:"Delete success"})
    }).catch(next)
})

app.get("/chat", function (req, res, next) {
    console.log(req.query)
    Chat.find({room_name:req.query.room_name}).then(data=>{
        // console.log(data)
        res.send({status_code:200, message:"Get chat", data:data})
    })
})

let thisRoom = "";
io.on("connection", function (socket) {
    console.log("connected");
    socket.on("join room", (data) => {
        console.log('in room');
        let Newuser = joinUser(socket.id, data.username,data.roomName)
        socket.emit('send data' , {id : socket.id ,username:Newuser.username, roomname : Newuser.roomname });

        thisRoom = Newuser.roomname;
        console.log(Newuser);
        socket.join(Newuser.roomname);
        io.to(thisRoom).emit("chat message", {data: {value:`${Newuser.username} has been join.`}, id : socket.id});
    });
    socket.on("chat message", (data) => {
        data.room_name = thisRoom
        console.log(data)
        Chat.create(data).then(()=>{
            io.to(thisRoom).emit("chat message", {data:data, id : socket.id});
        })

    });
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        console.log(user);
        if(user) {
            console.log(user.username + ' has left');
            let data = {
                value : user.username + ' has left chat'
            }
            io.to(thisRoom).emit("chat message", {data:data})
        }
        console.log("disconnected");

    });
});

http.listen(8000, function () {
    console.log("Server listen to 8000")
});