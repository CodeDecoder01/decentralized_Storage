const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const { v1: uuidv1 } = require('uuid');
uuidv1();
function Blockchain(){
    this.chain =[];
    this.pendingFileUploads=[];

    this.currentNodeUrl =currentNodeUrl;
    this.networkNodes=[];

    this.createNewBlock(100,'0','0');

};


Blockchain.prototype.createNewBlock = function(previousBlockHash,hash,nonce)
{
    const newBlock ={
        index: this.chain.length +1,
        timestamp : Date.now(),
        fileUpload: this.pendingFileUploads,
        hash      : hash,
        previousBlockHash: previousBlockHash,
        nonce: nonce
    };
    this.pendingFileUploads=[];
    this.chain.push(newBlock);

    return newBlock;
};


Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length -1 ];
};

Blockchain.prototype.createNewFileUpload =function(filename,size,sender,receiver)

{
    const newFileUpload = {
        filename: filename,
        size:     size,
        sender:   sender,
        receiver: receiver,
        fileId: uuidv1().split('-').join('')
    }

    return newFileUpload;
};


Blockchain.prototype.addNewFileToPendingFiles =function(fileObj){

     this.pendingFileUploads.push(fileObj);
     return this.getLastBlock()['index']+1;
};

Blockchain.prototype.hashBlock = function(previousBlockHash,currentBlockData){

    const dataStr= previousBlockHash +JSON.stringify(currentBlockData);
    const hash= sha256(dataStr);
    return hash;

};


Blockchain.prototype.proofOfWork =function(previousBlockHash,currentBlockData){
  
    let nonce=0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData);
    while(hash.substring(0,3) !== '000'){
        nonce++;
        hash=this.hashBlock(previousBlockHash,currentBlockData);
    }

    return nonce;
};

Blockchain.prototype.chainIsValid = function(blockchain){

    let validChain = true;
    for(var i=1;i<blockchain.length;i++)
    {
        const currentBlock=Blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashBlock(prevBlock[hash],{ fileUpload: currentBlock['fileUpload'], index: currentBlock['index'] }, currentBlock['nonce']);
        if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};


Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if (block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};


Blockchain.prototype.getFileUpload = function(FileId) {
	let correctFile = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.fileUpload.forEach(eachFile => {
			if (eachFile.fileId === FileId) {
				correctFile = eachFile;
				correctBlock = block;
			};
		});
	});

	return {
		fileUpload: correctFile,
		block: correctBlock
	};
};


module.exports = Blockchain;