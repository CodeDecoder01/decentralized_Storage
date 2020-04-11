const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const user = require('./models/userSchema');
//const uuid = require('uuid/v1');
const session = require('express-session');
const cookieParser=require('cookieparser');
const mongoose =require('mongoose');
const port = process.argv[2];
//const rp = require('request-promise');
//const nodeAddress = uuid().split('-').join('');
const filecoin = new Blockchain();
const uri = "mongodb+srv://anto:anto@cluster0-y2p9h.mongodb.net/test?retryWrites=true&w=majority";
const fs=require('fs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets',express.static('assets'));
app.set('view engine','ejs');
//app.use(cookieParser());
app.use(session({secret: "Secret key it is."}));


var sess;
//User Account creation page
app.get('/signup',function(req,res){

    res.render('signup.ejs');
     
});

app.post('/userSignup',function(req,res){

    sess=req.session;
    const User = new user({
        _id: req.body.email,
        firstName: req.body.fname,
        lastName: req.body.lname,
        password: req.body.password
      });
      User.save()
        .then(() => {
          // console.log(req.body.title);
          sess._id;
          sess.firstName;
          console.log('in here');
          res.send('User added successfully');
        })
        .catch(err => {
          console.log('email id exists');
          res.status(400).send(err);
        });
     
});

app.get('/login',function(req,res){

  res.render('login.ejs');
   
});

app.post('/userLogin',function(req,res){
    
    sess=req.session;
    user.findOne(req.body) //filters the posts by Id
    .then(result => {
      if(result !== null)
      {  sess._id;
        sess.firstName;
        res.send(result);
      }
      else
      {
        res.redirect('login');
      } 
    }).catch(err => {
      res.status(400).send(err);
    })
    
  
});



app.get('/',(req,res)=>{

    res.render('fileadd.ejs');

});

app.post('/addFile',(req,res)=>{
    var filename=req.body.file;
    var size=10;
    var resp=filecoin.createNewFileUpload(filename,size,'anto','prince');
    filecoin.addNewFileToPendingFiles(resp);
    fs.readFile(__dirname+filename,function(err,data){
      fs
      res.send(data);

    });   // res.json(req.body.file);
   

});

app.get('/node',(req,res)=>{

  
    res.render('Noderegister.ejs');

});

// register a node with the network
app.post('/register-node', function(req, res) {
  require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
    const newNodeUrl=add;
  
	//const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = filecoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = filecoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) filecoin.networkNodes.push(newNodeUrl);

  res.json({ note: 'New node registered successfully.',url: newNodeUrl });
});
});


app.get('/logout',(req,res) => {
  req.session.destroy((err) => {
      if(err) {
          return console.log(err);
      }
      res.redirect('/');
  });

});



mongoose.connect(uri,{useNewUrlParser: true,useUnifiedTopology: true })
  .then(()=>{
    console.log('database connected!');})
  .catch(err => console.log(err));

app.listen(port,()=>{
        console.log('Listening on port 3000');
    });

