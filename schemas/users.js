var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var userSchema = mongoose.Schema({
    name: String,
    group: String,
    current_session_id: String,
    notifications:[{topic:String,description:String,event_date:Date,pdf_link:String,recieved:Boolean}]
    
});

module.exports=mongoose.model('User',userSchema);