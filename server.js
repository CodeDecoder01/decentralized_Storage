const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
//const uuid = require('uuid/v1');
const port = process.argv[2];
//const rp = require('request-promise');


//const nodeAddress = uuid().split('-').join('');

const filecoin = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets',express.static('assets'));
app.set('view engine','ejs');


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

app.listen(port,()=>{
    console.log('Listening on port 3000');
});
