var express = require("express");
var path    = require("path");
var port    = process.env.PORT || 3000;

var bodyParser = require("body-parser");
var app =express();

app.use(express.static('client'))
app.use(bodyParser.json());

var dataPathDetails = {
    "count": 9,
    "data": [
      {
        "portName": "DataPath0",
        "AliasName": "alias0",
        "portDesp": "pd",
        "shutDown": true,
        "ipAddress": "101.101.1.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath1",
        "AliasName": "alias1",
        "portDesp": "pd",
        "shutDown": false,
        "ipAddress": "101.111.10.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath2",
        "AliasName": "alias2",
        "portDesp": "pd",
        "shutDown": false,
        "ipAddress": "111.11.111.1",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath3",
        "AliasName": "alias3",
        "portDesp": "pd",
        "shutDown": true,
        "ipAddress": "101.101.1.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath4",
        "AliasName": "alias4",
        "portDesp": "pd",
        "shutDown": true,
        "ipAddress": "101.101.1.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath5",
        "AliasName": "alias5",
        "portDesp": "pd",
        "shutDown": true,
        "ipAddress": "101.101.1.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath6",
        "AliasName": "alias6",
        "portDesp": "pd",
        "shutDown": true,
        "ipAddress": "101.101.1.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath7",
        "AliasName": "alias7",
        "portDesp": "pd",
        "shutDown": true,
        "ipAddress": "101.101.1.0",
        "speed": "1G",
        "mtu": 1500
        
      },
      {
        "portName": "DataPath8",
        "AliasName": "alias8",
        "portDesp": "pd",
        "shutDown": false,
        "ipAddress": "100.100.100.10",
        "speed": "1G",
        "mtu": 1500
        
      }
    ]
  };



//route /getData
app.get('/getData',(req,res)=>{
  res.json(dataPathDetails);
});

app.post('/updateData',(req,res)=>{
    var updatedValues =req.body;
      console.log(updatedValues);
      var updatedData= {
        "count": 9,
        "data" :[] 
      }
      updatedData.data= dataPathDetails.data.map(function(item){
        if(item.portName ===updatedValues.portNameOld){
            return {
                portName     : updatedValues.portName,
                AliasName    : updatedValues.AliasName,
                portDesp     : updatedValues.portDesp,
                shutDown   : updatedValues.shutDown,
                ipAddress   : updatedValues.ipAddress,
                speed   : updatedValues.speed,
                mtu   : updatedValues.mtu
            }
        }else{
            return item;
        }
     })

     dataPathDetails=updatedData;
     console.log("updated at server",updatedData)
     res.json(updatedData);
})


//for all other routes
app.get('*', (req,res)=> {
  res.sendFile(path.join(__dirname + '/client/index.html'));
});


app.listen(port,()=>{
  console.log("server is listening on ", port)})