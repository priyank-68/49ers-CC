var connection  = function(c_Id, c_Name,c_topic,details,date,time,location,imageURL){
var connectionModel = {connectionID:c_Id, connectionName:c_Name,connectionTopic:c_topic,Details:details,Date:date,Time:time,Location:location,imageURL:imageURL};
return connectionModel;
};

module.exports.connection = connection;
