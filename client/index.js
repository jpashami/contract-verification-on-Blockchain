const { ethers } = require("ethers");
import configuration from '../build/contracts/Notary139.json';
const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;
var documentContent = '';
let myContract;
var contractAddr = CONTRACT_ADDRESS;
var abi = CONTRACT_ABI;
const buyerAddress = ethers.utils.getAddress('0x2D6a723DcA1852aD17CE1e28344A6A055e0773cf');
const sellerAddress = ethers.utils.getAddress('0xA50AaDC34a9e7b7efa5cf74653425Af7Fc001bf6');
  

var getConnected = async function () {
  console.log('version 43');
  if (typeof window.ethereum !== 'undefined') {
    await ethereum.request({method: 'eth_requestAccounts'}).then(console.log);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    myContract = new ethers.Contract(contractAddr, abi, provider);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner(); 
    console.log("signer",signer);
    const signerAddress = await signer.getAddress();
    console.log('owner address =', signerAddress);
    // Look up the current block number
    await provider.getBlockNumber().then((blockNumber) => {console.log("blockNumber",blockNumber)});
  } else {
    console.log('Install a Crypto wallet like MetaMask');
    document.getElementById('connectionStatus').innerHTML = 'Install a Crypto wallet like MetaMask';
  }
  documentContent = await myContract.getContent139();
  document.getElementById('contractAddress').innerHTML =`<em><strong>Document Address on the Blockchian: </strong>${contractAddr}</em>`;
  document.getElementById('contractContent').innerHTML ="<em><strong>Document Hashed content: </strong>" + documentContent + "</em>";
  
}

var setDocumentContent139 = async function () {
  // get the message from UI
  documentContent = document.getElementById("agreementContent").value;
  console.log(documentContent);
  // hash the message
  const hashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(documentContent)).toString('hex');
  console.log('Hashed Message: ',hashedMessage);
  // writing on Smart Contract
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  console.log("Signer",signer);
  let myContractWithSigner = new ethers.Contract(contractAddr, abi, signer);
  await myContractWithSigner.setContent139(hashedMessage);
  await myContractWithSigner.setContractStatus139("Pending for both parties");
  
  // retrieve the hash from Smart Contract
  let docContent = await myContract.getContent139();
  document.getElementById('contractContent').innerHTML ="<em><strong>Document Hashed content: </strong>" + docContent + "</em>";
}


async function documentVerification139() {
  documentContent = document.getElementById("agreementContent").value;
  console.log(documentContent);
  // hash it
  const hashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(documentContent)).toString('hex');
  console.log('Hashed Message: ',hashedMessage);
  
  // retrieve the hash from the blockchain
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  console.log("signer", signer);
  let docHash = await myContract.getContent139();

  //compare the document hash and stored hash to verify or cancel the request 
  if (docHash === hashedMessage) {
    console.log("Hash Verified!");
    document.getElementById('verificationMessage').innerHTML = "<em>Document Verification: <strong>Verified!</strong></em>";
    document.getElementById('signContract').disabled = false;
  } else {
    console.log("Hash verification Failed!")
    document.getElementById('verificationMessage').innerHTML = "<em>Document Verification: <strong>Failed!</strong></em>";
    document.getElementById('signContract').disabled = true;
  }
}

async function signContract139() {
  documentContent = document.getElementById("agreementContent").value;
  const hashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(documentContent)).toString('hex');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log("Signer Address", address);
  
  if (address == buyerAddress) {
    signature = await signer.signMessage(hashedMessage)
    console.log("Signed by BUYER. signature : ", signature);
    document.getElementById('signerName').innerHTML = "<em>Signer Name: <strong>BUYER</strong></em>";
    document.getElementById('signerAddress').innerHTML = "Signer Address: " + address;
    document.getElementById('signerSignature').innerHTML = "Signature: " + signature;
    let contractStatus = await myContract.getContractStatus139();
    console.log(contractStatus);
    if (contractStatus == "Pending for both parties") {
      contractStatus = "Buyer verified, Pending for seller";
    } else if (contractStatus == "Seller verified, Pending for Buyer") {
      contractStatus = "Both verified";
    }
    // writing on smart contract
    let myContractWithSigner = new ethers.Contract(contractAddr, abi, signer);
    const tx = await myContractWithSigner.setContractStatus139(contractStatus);
    console.log("tx hash",tx.hash);
    await tx.wait();
  } else if (address == sellerAddress) {
    signature = await signer.signMessage(hashedMessage)
    console.log("Signed by SELLER. signature : ", signature);
    document.getElementById('signerName').innerHTML = "<em>Signer Name: <strong>SELLER</strong></em>";
    document.getElementById('signerAddress').innerHTML = "Signer Address: " + address;
    document.getElementById('signerSignature').innerHTML = "Signature: " + signature;
    let contractStatus = await myContract.getContractStatus139();
    console.log(contractStatus);
    if (contractStatus == "Pending for both parties") {
      contractStatus = "Seller verified, Pending for Buyer";
    } else if (contractStatus == "Buyer verified, Pending for seller") {
      contractStatus = "Both verified";
    }
    // writing on smart contract
    let myContractWithSigner = new ethers.Contract(contractAddr, abi, signer);
    const tx = await myContractWithSigner.setContractStatus139(contractStatus);
    console.log("tx hash",tx.hash);
  } else {
    console.log("Signer is not matching with buyer or seller.")
    document.getElementById('signerName').innerHTML = "<em>Signer is not matching with buyer or seller.<strong>Access Failed!</strong></em>";
  }

  await getContractStatus139();
  // let signingAddress = ethers.utils.verifyMessage(hashedMessage, signature);
  // console.log('Signing Address: ', signingAddress);
  // let recoverAddress = ethers.utils.recoverAddress ( hashedMessage , signature );
  // console.log('Recover Address: ', recoverAddress);
  // let publicKey = ethers.utils.recoverPublicKey(hashedMessage , signature);
  // console.log('Public Key: ', publicKey);
}

async function cancelContract139() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log("Signer Address", address);
  if (address == buyerAddress) {
    let contractStatus = "Canceled by buyer";
    let myContractWithSigner = new ethers.Contract(contractAddr, abi, signer);
    const tx = await myContractWithSigner.setContractStatus139(contractStatus);
    console.log("tx hash",tx.hash);
    await tx.wait();
    document.getElementById('signerName').innerHTML = "<em>Signer Name: <strong>BUYER</strong></em>";
    document.getElementById('signerAddress').innerHTML = "Signer Address: " + address;
    document.getElementById('signerSignature').innerHTML = "<em>Document canceled by buyer</em>";
  } else if (address == sellerAddress) {
    let contractStatus = "Canceled by seller";
    let myContractWithSigner = new ethers.Contract(contractAddr, abi, signer);
    const tx = await myContractWithSigner.setContractStatus139(contractStatus);
    console.log("tx hash",tx.hash);
    await tx.wait();
    document.getElementById('signerName').innerHTML = "<em>Signer Name: <strong>BUYER</strong></em>";
    document.getElementById('signerAddress').innerHTML = "Signer Address: " + address;
    document.getElementById('signerSignature').innerHTML = "<em>Document canceled by seller</em>";
  } else {
    console.log("Signer is not matching with buyer or seller.")
    document.getElementById('signerName').innerHTML = "<em>You are not authorized to cancel the agreement.<strong>Access Failed!</strong></em>";
  }
  await getContractStatus139();
}

var getContractStatus139 = async function () {
  let contractStatus = await myContract.getContractStatus139();
  console.log("status: "+contractStatus);
  document.getElementById("contractStatus").innerHTML =  `<em><strong>Document Status: </strong> ${contractStatus} </em> `;
  return contractStatus;
}

// Event Listeners
document.getElementById("submitAgreement").addEventListener("click", function(e){
  e.preventDefault();
  setDocumentContent139()
});

document.getElementById("getContractStatus").addEventListener("click", function(e){
  e.preventDefault();
  console.log("e:",e);
  getContractStatus139()
});

document.getElementById("verifyDocument").addEventListener("click", function(e){
  e.preventDefault();
  console.log("e:",e);
  documentVerification139()
});

document.getElementById("cancelContract").addEventListener("click", function(e){
  e.preventDefault();
  console.log("e:",e);
  cancelContract139()
});

document.getElementById("signContract").addEventListener("click", function(e){
  e.preventDefault();
  console.log("e:",e);
  signContract139().then(recippt => {
    console.log("recippt")
  })
});

document.getElementById('signContract').disabled = true;
getConnected().then(function (recippt) {
  console.log('Connected',recippt)
  document.getElementById('connectionStatus').innerHTML = '<em>Connected</em>';
}).catch(function (err) {
  console.log('Connection error',err)
});