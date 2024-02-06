
// import { ECPair as _ECPair, payments } from '../js/bitcoinjs-lib';
// import { ECPairFactory } from "/assets/js/ecpair";
// import tinySecp256k1 from "/assets/js/tiny-secp256k1";
// const ECPair = ECPairFactory(tinySecp256k1);
// import crypto from "/assets/js/crypto";




$(document).ready(function() {
    $('#getTransactionDetails').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"decodeRawTransaction",hexString: $("#hexString").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });


    $('#getRedeemScript').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"getRedeemScriptHex",bytesEncoding: $("#bytesEncoding").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
   
});


    

   


