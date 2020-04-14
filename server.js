const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const uuid = require('uuid/v1');
const session = require('express-session');
const mongoose =require('mongoose');
const port = process.argv[2];
const uri = "mongodb+srv://anto:anto@cluster0-y2p9h.mongodb.net/test?retryWrites=true&w=majority";
const Blockchain = require('./blockchain');
const filecoin = new Blockchain();
const user = require('./models/userSchema');
const node = require('./models/nodeSchema');
const cookieParser=require('cookieparser');
const fs=require('fs');
const rp= require('request-promise');
//const rp = require('request-promise');
//const nodeAddress = uuid().split('-').join('');





app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets',express.static('assets'));
app.set('view engine','ejs');
//app.use(cookieParser());
app.use(session({secret: "Secret key it is."}));







var sess;


//Home page
app.get('/',(req,res)=>{

  res.render('home.ejs');

});


app.get('/blockchain',function(req,res){
  res.send(filecoin);
});

//User Account creation page
app.get('/signup',function(req,res){

    res.render('signup.ejs');
     
});

app.post('/userSignup',function(req,res){

    sess=req.session;
    const User = new user({
        _id: req.body._id,
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


//Account Login
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


//Node account creation
app.get('/nodesignup',function(req,res){

  res.render('nodesignup.ejs');
   
});

// register a node with the network
app.post('/nodeSignup', function(req, res) {
  sess=req.session;
  const Node = new node({
      _id: req.body._id,
      firstName: req.body.fname,
      lastName: req.body.lname,
      password: req.body.password
    });
    Node.save()
      .then(() => {
        // console.log(req.body.title);
        sess._id;
        sess.firstName;
        console.log('in here');
         res.json(Node);     })
    .catch(err => {
        console.log('email id exists');
      res.status(400).send(err);
});
});


app.get('/register-node',function(req,res){
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
  const newNodeUrl=add;

  //const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = filecoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = filecoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) 
  {
    filecoin.networkNodes.push(newNodeUrl);
  }
res.json({ note: 'New node registered successfully.',url: newNodeUrl });
});
});


//Account Login
app.get('/nodelogin',function(req,res){

res.render('login.ejs');
 
});

app.post('/nodeLogin',function(req,res){
  
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

app.get('/file',function(req,res){

    res.render('fileadd.ejs');
});


app.post('/addFile',(req,res)=>{
    var filename=req.body.file;
    var size=10;
    var resp=filecoin.createNewFileUpload(filename,size,'anto','prince');
    filecoin.addNewFileToPendingFiles(resp);
    // fs.readFile(__dirname+filename,function(err,data){
      
    //   res.send(data);

    // });   // res.json(req.body.file);
   
   res.redirect('/blockchain')

});

// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	filecoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = filecoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !filecoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			filecoin.chain = newLongestChain;
			filecoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: filecoin.chain
			});
		}
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





// require('dns').lookup(require('os').hostname(), function (err, add, fam) {
//   console.log('addr: '+add);
//   const newNodeUrl=add;

//   //const newNodeUrl = req.body.newNodeUrl;
//   const nodeNotAlreadyPresent = filecoin.networkNodes.indexOf(newNodeUrl) == -1;
//   const notCurrentNode = filecoin.currentNodeUrl !== newNodeUrl;
//   if (nodeNotAlreadyPresent && notCurrentNode) filecoin.networkNodes.push(newNodeUrl);
// });

mongoose.connect(uri,{useNewUrlParser: true,useUnifiedTopology: true })
  .then(()=>{
    console.log('database connected!');})
  .catch(err => console.log(err));

app.listen(port,()=>{
        console.log('Listening on port',port);
    });

