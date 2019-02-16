var express = require('express');
var app = require('express')();
var MongoClient = require('mongodb').MongoClient;
var users=require('./schemas/users')
var http = require('http').Server(app);
var logger = require('morgan');
var multiparty = require('multiparty');
var bodyParser=require('body-parser');
var io = require('socket.io')(http);
var mongoose=require('mongoose');
var multer  =   require('multer');  
var upload = require('express-fileupload');
app.use('/static', express.static(__dirname+"/public/images"));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(upload());
app.use(bodyParser.urlencoded({ extended: true }));

var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, file.originalname);  
  }  
});  
var upload = multer({ storage : storage}).single('myfile');  
var xxx;
mongoose.connect("mongodb://localhost/firststep",function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log('connected to database');
    }
});

app.get('/',function(req,res){   
    console.log(__dirname);
    res.send("hhhhhhhhhhheeeeeeeelllllllooooooo");
})

var not = io
  .on('connection', function (socket) {
    console.log(socket.id);
    socket.on('connected',function(data){
        console.log(data.name);
        send_pending_notifications(data.name,socket.id);
    });
    socket.on('disconnect',function(){
        console.log(socket.name);
        users.findOne({session_id:socket.id}, function(err, data){
            data.current_session_id="null";
            users.save(function (err) {
            if(err) {
                console.error('ERROR!');
            }

            }); 
        });
    });
    socket.on('disconnected',function(data){
        console.log(data.name);

    })
    
})
.on('hell',function(){
    console.log("hell");
  })

function send_pending_notifications(user_name, session_id) {
    var dbo = db.db("mydb");
    var mysort = { event_date: -1 };
    users.findOne({name:user_name}).sort(mysort, function(err, data){
        data.current_session_id=session_id;
        var i;
        for(i in data.notifications){
            if(!data.notifications[i].recieved){
                //send noti to user using socket
                    io.sockets.socket(data.current_session_id).emit('message',data.notifications[i]);
                    data.notifications[i]=1;
            }
        }
        users.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }
    });



});
}
//all requests#################################

  
app.post('/upload',function(req,res){  
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
       console.log(files.file);
    }); 
    
});  

app.get('/upload_images',function(req,res){  

    res.sendFile(__dirname+'/image_upload.html');
});

app.post('/upload_images',function(req,res){  
    if(req.files.upfile){
        var i=0;
        var file = req.files.upfile;
        for(i=0;i<file.length;i++){  
           
            var uploadpath = __dirname + '/public/images/image'+i+'.jpg';
            // console.log(file[i]);
            file[i].mv(uploadpath,function(err){
                if(err){
                    console.log("File Upload Failed",uploadpath,err);
                    //res.send("Error Occured!")
                }
                else {
                    console.log("File Uploaded",uploadpath);
                    
                }
            });
            
        }
        res.send('Done! Uploading files')
    }

})

app.post('/notification', function(req, res, next) { 
    //console.log("hhhhhhheeeeeelllllllloooooooo");
    //{$or:[{region: "NA"},{sector:"Some Sector"}]}
    var noti={
        topic:req.body.topic,
        description:req.body.description,
        event_date:new Date(req.body.date),
        pdf_link:'null',
        recieved:0
    }
    var id=[];
    var sockets = io.sockets.sockets;
    for(var k in sockets){
        id.push(k);
    }
    var i;
    var go='{"data":[';
    var d;
    var gro=req.body.groups;
    if(gro.includes(",")){
            var groups2=gro.split(",");
            for (i=0;i<groups2.length-1;i++){
            go=go+'{"group":"'+groups2[i]+'"},';
        }
        go=go+'{"group":"'+groups2[groups2.length-1]+'"}';
        go=go+"]}"
  
    }else{
        go=go+'{"group":"'+gro+'"}';
        go=go+"]}"

    }
    //var groups2=gro.split(",");
    
   
    //var x = JSON.parse('{ "name":"John", "age":30, "city":"New York"}');
    var x=JSON.parse(go);
    console.log(x);
    users.find({$or:x.data}, function(err, data){
        var len=data.length;
        for(var j=0;j<len;j++)
             {  console.log(data[j].name);
                if (id.includes(data.current_session_id)) {
                    noti.recieved=1;
                }
                data[j].notifications.push(noti);
                data[j].save(function (err) {
                    if(err) {
                    console.error('ERROR!');
                    res.send("error")
                    }
                    });
             }    
    });
    io.sockets.emit('message',noti);
    res.send("success");




});

app.post('/new_user', function(req, res, next) { 
    var newUser = new users({
    name: req.body.name,
    group: req.body.group,
    current_session_id: 'null'
       
    });
    newUser.save(function (err) {
        if(err) {
            console.error('ERROR!');
            res.send("error");
        }else{
            res.send("saved");
        }
    });
    
});

http.listen(8080,function(){
    console.log('server listening on port 3000');
})
