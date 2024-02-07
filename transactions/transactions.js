import * as crypto from "crypto";
import bitcoin from 'bitcoinjs-lib';
import * as ecpair from 'ecpair';
import * as secp256k1  from "tiny-secp256k1";


import axios from 'axios';


const ECPair = ecpair.ECPairFactory(secp256k1);

const keyPair = ECPair.fromPrivateKey(Buffer.from("d4473603292312d2b5662cc05e27df987a101c4f7b6428107df84b9595ecbffe","hex"));




const getWalletAddress = async () => {

   const network = bitcoin.networks.testnet;
  // const address = keyPair.getAddress();
 return bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: network }).address;


}


// private key in hex of arbitrary wallet
// d4473603292312d2b5662cc05e27df987a101c4f7b6428107df84b9595ecbffe
function getRedeemScriptHex(bytesEncoding) {

    const preimage = Buffer.from(bytesEncoding, 'hex');
    const lockHash = bitcoin.crypto.hash256(preimage);
    const redeemScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_SHA256,
    lockHash,
    bitcoin.opcodes.OP_EQUAL
    ]);

    return redeemScript.toString('hex');
   
}


// total in wallet: 0.00069541 tBTC



const  getTransactionHex = async (amount)  => {

   
  let rawUTXOHex = "";
  amount = (amount === undefined) || (amount.trim() === "") || (parseFloat(amount) === NaN)  ? 1000: parseFloat(amount) / 100000000;
  try {

// Assuming the provided hex is a redeem script for demonstration
const redeemScriptHex = '010101029301038801027693010487';
const redeemScriptBuffer = Buffer.from(redeemScriptHex, 'hex');
 const network = bitcoin.networks.testnet;

// Derive P2SH address from redeem script
const recipientAddress = bitcoin.payments.p2sh({
  redeem: { output: redeemScriptBuffer },
   network: bitcoin.networks.testnet
}).address;





// Construct a transaction (Example)
const txb = new bitcoin.Psbt({network:network});



// Add inputs - Normally, you'd obtain txId and vout from a UTXO database or a wallet
// For demonstration, these are placeholder values
const txId = 'a31805a3978b8cbf4f86621aeec50f178279f9dbf444afffda3a9ac3e13ae045'; // Transaction ID of the UTXO
const vout = 0; // Output index of the UTXO


//  const rawUTXOHex = "1000000019eeedca2d6d8a97f347850139fab14ff4ced15ce34541ed4fcffb1de3b0ab3031a0000006b48304502210097d48a10c4e56f7f88d31a74b36957cb94265ad3422cb06999305300f1f90bf302206e00f01e66858149f920360d60c3e7b7cb055a6e128b1ad9ddc9947a919cf5db0121034ef1122c59bdc9c5e05b02ee6400b8fc9b9c293f40165b5f2d704555d751abceffffffff024d0507000000000017a9149c88a1e76348e9009c9b15c2bcd1f923b0fff0d087e8d70000000000001976a914560f5684d45627305ea0f1166ce2f70dec64876088ac00000000".trim();
 

   rawUTXOHex = (await axios({
    method: 'get',
    url: `https://blockstream.info/testnet/api/tx/${txId}/hex`,
    headers: { 'Content-Type': 'text/plain' },
  })).data;



txb.addInput({
  hash: txId,
  index: vout,
  nonWitnessUtxo: Buffer.from(rawUTXOHex,"hex")
});


 
txb.addOutput({
  address: recipientAddress,
  value: amount,
})


   // Signing the transaction would be the next step, requiring access to the private key
   txb.signInput(0,keyPair);

   // Once signed, you can build and serialize the transaction
   const transaction = txb.finalizeInput(0).extractTransaction();

    return {"txt_hex":transaction.toHex()};

  } catch (error) {

    // error.response ? error.response.data : error.message
    return {"error":'Failed transaction: ' +  error.message,"raw":rawUTXOHex};
  }
}

// after completing the test of sendBTC: this was the response
//{
//   "txt_id": "7e44429a375f7c9b4b71342a2284b271045eef27d1b6b231840d6138d4746bd8",
//   "hex_contructed_txt": {
//       "txt_hex": "020000000145e03ae1c39a3adaffaf44f4dbf97982170fc5ee1a62864fbf8c8b97a30518a3000000006b483045022100e07e2f46baf7871eb39f21ef96c567b7196375036c412d7ee5d30ccda54b936702205268d5a0da79f91f725cc4ccc320f3891b0fbf36dba92a547b4999ccf1a1494701210324077e816ee97a2ed9c27ad305b5be86200cd161ad36901e5ad4fb3d2e48f11dffffffff01e80300000000000017a9141c99440e4938b969f26e3792f85b457c0365625b8700000000"
//   }
// }
const sendBTC = async (amount) => {

   const hex = await getTransactionHex(amount);
  
    try {
      if(hex["txt_hex"] === undefined) throw new Error(hex["error"]);
      const response = await axios({
        method: 'POST',
        url: 'https://blockstream.info/testnet/api/tx',
        data: hex["txt_hex"],
        headers: { 'Content-Type': 'text/plain' },
      });
  
      return {'txt_id':response.data,"hex_contructed_txt":hex};
    } catch (error) {
      // error.response ? error.response.data : error.message
      return {"error":'Failed to broadcast transaction:' +   error.message + " " + hex["error"]};
    }

  };
      
   


export { getTransactionHex , getRedeemScriptHex , sendBTC  , getWalletAddress }