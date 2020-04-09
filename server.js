const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
//const uuid = require('uuid/v1');
// const mongodb = require('mongodb');
const mongoose =require('mongoose');
const port = process.argv[2];

//const rp = require('request-promise');
//const nodeAddress = uuid().split('-').join('');
// const url = "mongodb+srv://anto:anto@cluster0-y2p9h.mongodb.net/test?authSource=admin&retryWrites=true&w=majority";
const filecoin = new Blockchain();
const uri = "mongodb+srv://anto:anto@cluster0-y2p9h.mongodb.net/test?retryWrites=true&w=majority";


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets',express.static('assets'));
app.set('view engine','ejs');




app.get('client.ejs',function(req,res){

    res.render('client.ejs');
     
});

app.get('node.ejs',function(req,res){
    res.render('node.ejs');

});

app.get('/',(req,res)=>{

    res.render('fileadd.ejs');

});

app.post('/addFile',(req,res)=>{
    var filename=req.body.filename;
    var size=10;
    var resp=filecoin.createNewFileUpload(filename,size,'anto','prince');
    filecoin.addNewFileToPendingFiles(resp);
    res.json(filecoin);
});

app.get('/node',(req,res)=>{

    res.render('Noderegister.ejs');

});

// register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = filecoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = filecoin.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) filecoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.',url: newNodeUrl });
});



mongoose.connect(uri,{useNewUrlParser: true,useUnifiedTopology: true })
  .then(()=>{
    console.log('database connected!');})
  .catch(err => console.log(err));

app.listen(port,()=>{
        console.log('Listening on port 3000');
    });

