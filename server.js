var express = require("express");
var path    = require("path");
var port    = process.env.PORT || 3000;

var bodyParser = require("body-parser");
var app =express();

//middleware
app.use(express.static('client'))
app.use(bodyParser.json());

//for all other routes
app.get('*', (req,res)=> {
  res.sendFile(path.join(__dirname + '/client/index.html'));
});

//server listen
app.listen(port,()=>{
  console.log("server is listening on ", port)})