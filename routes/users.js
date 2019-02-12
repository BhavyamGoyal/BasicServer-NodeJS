var express = require('express');
var router = express.Router();
var app = require('express')();
var MongoClient = require('mongodb').MongoClient;
var users=require('../schemas/users')
var http = require('http').Server(app);
var io = require('socket.io')(http);



app.get('/',function(req,res){   
    res.send("hhhhhhhhhhheeeeeeeelllllllooooooo");
})



var noti = io
  .on('connection', function (socket) {
  	socket.on('connected',function(data){
    	send_pending_notifications(data.name,socket.id);
    })
	socket.on('disconnect',function(){
        console.log('one user disconnected'+socket.id);
        users.findone({session_id:socket.id}, function(err, data){
        	data.current_session_id="null";
        	users.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }

    });

   });
});
});

function send_pending_notifications(user_name, session_id) {
	var dbo = db.db("mydb");
	var mysort = { event_date: -1 };
	users.find({name:user_name}).sort(mysort, function(err, data){
		data.current_session_id=session_id;
		var i;
		for(i in data.notifications){
			if(data.notifications[i].recieved){
				//send noti to user using socket
                	noti.sockets.socket(data.current_session_id).emit('message',data.notifications[i]);
			}
		}
		users.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }
    });



});
}

router.post('/notification', function(req, res, next) { 
	console.log("hhhhhhheeeeeelllllllloooooooo");
	//{$or:[{region: "NA"},{sector:"Some Sector"}]}
	var i;
	String gro="{data:[";
	String d;
	var gorups2=req.body.groups;
	for(i in groups2){
		gro=gro+"{name:"+groups2[i]+"},";

	}
	gro=gro+"]}"
	var x=JSON.parse(gro);
	console.log(x);
	//users.find({name:user_name}).sort(mysort, function(err, data){






});
router.post('/new_user', function(req, res, next) { 
	console.log("hhhhhhheeeeeelllllllloooooooo");


	var newUser = new users({
	name: req.body.name,
    group: req.body.group,
    current_session_id: 'null'
       
    });
});
router.get('/notification', function(req, res, next) { 
	console.log("hhhhhhheeeeeelllllllloooooooo");
	res.send("hhhhhheeeeelllloooo");
});
module.exports = router;
