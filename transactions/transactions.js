import * as crypto from "crypto";
import bitcoin from 'bitcoinjs-lib';
import * as ecpair from 'ecpair';
import * as secp256k1  from "tiny-secp256k1";


import axios from 'axios';


const ECPair = ecpair.ECPairFactory(secp256k1);

const keyPair = ECPair.fromPrivateKey(Buffer.from("d4473603292312d2b5662cc05e27df987a101c4f7b6428107df84b9595ecbffe","hex"));

const stackEval = (stack) => {
//   Stack Evaluation:

// Initial State:

// Stack: [] (empty)
// 01: Push 0x01 onto the stack

// Stack: [0x01]
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01]
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01]
// 02: Duplicate the top item on the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 93: Divide the top two items on the stack

// Stack: [0x01, 0x01, 0x01] (0x01 / 0x01 = 0x01)
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 03: Push 0x03 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01, 0x03]
// 88: Equal (VERIFY): Check if the top two items are equal

// Stack: [0x01, 0x01, 0x01] (0x01 == 0x03 is false, but VERIFY doesn't pop values)
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 02: Duplicate the top item on the stack

// Stack: [0x01, 0x01, 0x01, 0x01, 0x01]
// 76: Data push: the next byte (0x93) determines the length of the data

// Stack: [0x01, 0x01, 0x01, 0x01] (no data pushed)
// 93: Divide the top two items on the stack

// Stack: [0x01, 0x01, 0x01] (0x01 / 0x01 = 0x01)
// 01: Push 0x01 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01]
// 04: Push 0x04 onto the stack

// Stack: [0x01, 0x01, 0x01, 0x01, 0x04]
// 87: Equal: Check if the top two items are equal

// Stack: [0x01, 0x01, 0x01] (0x01 == 0x04 is false)
// Final State:

// Stack: [0x01, 0x01, 0x01]
// Result:

// The script evaluates to FALSE because the final comparison (0x01 == 0x04) is false.
}

const isTaprootOutput = output => {
  // Taproot outputs have a scriptPubKey starting with OP_1 (0x51) followed by a 32-byte or  public key
  return  output.script.length === 34 && output.script[0] === 0x51 ;
}

const isSegwitInput = input => {
  // SegWit inputs have a non-empty witness field
  return input.witness.length > 0;
}

const isRBFEnabled = input => {
  // RBF is signaled by a sequence number less than 0xffffffff
  return input.sequence < 0xffffffff;
}

const analyzeTransaction = tx => {
  const isSegWit = tx.ins.some(isSegwitInput);
  const isRBF = tx.ins.some(isRBFEnabled);
  const containsTaprootOutput = tx.outs.some(isTaprootOutput);

  let txType = 'Legacy';
  if (isSegWit) {
      txType = 'SegWit';
  }
  if (containsTaprootOutput) {
      txType += '/Taproot';
  }
  if (isRBF) {
      txType += '/RBF';
  }
  return txType;
}


function parseTransaction(hexStrings) {
  
 

  let resultsObj = {};

  hexStrings.forEach((hex,index) => {
    
  const tx = bitcoin.Transaction.fromHex(hex);
  const version = tx.version;
  const locktime = tx.locktime;
  const txType = analyzeTransaction(tx);
  const inputs = tx.ins.map(input => {
      return {
          txId: Buffer.from(input.hash).reverse().toString('hex'),
          vout: input.index,
          script: bitcoin.script.toASM(input.script),
          sequence: input.sequence,
      };
  });
  const outputs = tx.outs.map(output => {
      return {
          value: (output.value / 1e8) + " BTC",
           scriptPubKey: output.script.length,
           //scriptPubKey: bitcoin.script.toASM(output.script),
      };
  });
  resultsObj[index] = {'type':txType ,'version': version,'inputs': inputs,'outputs': outputs,'locktime': locktime};
  });


  return resultsObj;

}

const getWalletAddress = async () => {

   const network = bitcoin.networks.testnet;
  // const address = keyPair.getAddress();
 return bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: network }).address;


}


// private key in hex of arbitrary wallet
// d4473603292312d2b5662cc05e27df987a101c4f7b6428107df84b9595ecbffe
const getRedeemScriptHex =(bytesEncoding) =>{

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



const  getTransactionHex = async (preimage)  => {

  
   
  let rawUTXOHex = "";
  amount = (amount === undefined) || (amount.trim() === "") || (parseFloat(amount) === NaN)  ? 1000: parseFloat(amount) / 100000000;
  try {

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
const txId = '7e44429a375f7c9b4b71342a2284b271045eef27d1b6b231840d6138d4746bd8'; // Transaction ID of the UTXO
const vout = 0; // Output index of the UTXO

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

// This sends bitcoin with bytesEncoding: 010101029301038801027693010487
const sendBTC = async (amount,redeemScriptHex) => {

   const hex = await getTransactionHex(amount,redeemScriptHex);
  
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
      


// get the redeem script hex
const getRedeemScriptHexForBtrust = (preimage) => {

const network = bitcoin.networks.testnet;
   
// Preimage
const preimageHash = crypto.createHash('sha256').update(preimage).digest('hex');

// Redeem script: OP_SHA256 <lock_hex> OP_EQUAL
const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_SHA256,
  Buffer.from(preimageHash, 'hex'),
  bitcoin.opcodes.OP_EQUAL,
]);

const redeemScriptHex =  redeemScript.toString('hex');
const redeemScriptBuffer = Buffer.from(redeemScriptHex, 'hex');
const p2sh = bitcoin.payments.p2sh({ // Destination address
     redeem: { output : redeemScriptBuffer },
     network: network
  });
   
  // the recipient address 2MwDHax5L9jXVGmnhN2YECEx63ickZaf7n9
  const recipientAddress = p2sh.address;


  // on bash 
  //bitcoin-cli createrawtransaction '[{"txid":"868b2ca699a2cd9d3ec279f4fe3aed1568821db25eeb6b80c37a34813ed4ce43", "vout":0}]' '{"2MwDHax5L9jXVGmnhN2YECEx63ickZaf7n9":0.10000000, "bcrt1qu52656mwk9l4ptzt6jruckcwzrynfaygf4qqtr":49.8999100}'


  // which yielded this below:
  //020000000143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48800000000

  // then 
  // bitcoin-cli signrawtransactionwithwallet "020000000143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48800000000"

  // which yielded this below:
  // {
  //   "hex": "0200000000010143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48802473044022034e5018f708f75b9d90094dda97fcd4ba4929cf2ef9484362afa372a4594f6bc02203bcbe2d72960e28b84b8fea5a56610770ff63399a3248663e8879ec5198961f0012103982a7caa4174728f76223c2f68c188b69fc06c785517bca3c121561e3fb2a6c400000000",
  //   "complete": true
  // }

  // then
  // bitcoin-cli sendrawtransaction "0200000000010143ced43e81347ac3806beb5eb21d826815ed3afef479c23e9dcda299a62c8b860000000000fdffffff02809698000000000017a9142b82aca6a490542944bdceb48aec066dc7cb1b618758386d2901000000160014e515aa6b6eb17f50ac4bd487cc5b0e10c934f48802473044022034e5018f708f75b9d90094dda97fcd4ba4929cf2ef9484362afa372a4594f6bc02203bcbe2d72960e28b84b8fea5a56610770ff63399a3248663e8879ec5198961f0012103982a7caa4174728f76223c2f68c188b69fc06c785517bca3c121561e3fb2a6c400000000"

  // which yielded this below:
  // aa3fa360386a20eb583890e26ed18e1aa782e29fd54f27c3fe033fc4153bcd4b
}





export { parseTransaction , getTransactionHex , getRedeemScriptHex , sendBTC  , getWalletAddress , getRedeemScriptHexForBtrust  }