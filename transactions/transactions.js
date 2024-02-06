import * as crypto from "crypto";
import bitcoin from 'bitcoinjs-lib';



function hash160(buffer) {
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest();
    return crypto.createHash('ripemd160').update(sha256Hash).digest();
}

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


function getAddressFromPreimage(bytesEncoding) {

    const redeemScriptHex = getRedeemScriptHex(bytesEncoding);
    const redeemScriptBuff = Buffer.from(redeemScriptHex, 'hex');
    const scriptHash = bitcoin.crypto.hash160(redeemScriptBuff);
    const p2shScript = bitcoin.script.scriptHashOutput.encode(scriptHash);
    const address = bitcoin.address.toOutputScript(p2shScript, bitcoin.networks.testnet);

   return address;
}



export { getAddressFromPreimage,getRedeemScriptHex }