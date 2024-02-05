
// import { ECPair as _ECPair, payments } from '../js/bitcoinjs-lib';
// import { ECPairFactory } from "/assets/js/ecpair";
// import tinySecp256k1 from "/assets/js/tiny-secp256k1";
// const ECPair = ECPairFactory(tinySecp256k1);
// import crypto from "/assets/js/crypto";




$(document).ready(function() {
    $('#generateAddress').click(function(e) {
        // console.log(bitcoin.networks.testnet);
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
        
    });

    $('#sendForm').submit(function(event) {
        event.preventDefault();
        const recipientAddress = $('#recipientAddress').val();
        const amount = parseFloat($('#amount').val());
        sendBitcoin(recipientAddress, amount);
    });
});

function sendBitcoin(toAddress, amount) {
    // Placeholder for transaction logic
    console.log(`Sending ${amount} BTC to ${toAddress}`);
    // In a real implementation, you would construct and broadcast a transaction here
}
