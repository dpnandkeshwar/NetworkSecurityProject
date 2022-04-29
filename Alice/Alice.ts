import { assert } from 'console';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import * as net from 'net';
import { logBreak, logTitledJson, logTitledObject, logTitledString } from './outputUtil';


// type AliceToKDC = { n1: string, alice: string, bob : string,  nB : string};
type EncryptedResponse = {data : string}

 

async function request(toKDC : string, url : string) : Promise<string> {    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        },
        body: toKDC
    });
    const body = await response.json();
    // console.log("---------Encrypted  json received from the KDC ------------")
    //console.log(body.data);
    return body.data;
}

function getDecryptedJson(encrypted : string){
    //decrypt the data
    const keyBytes = Buffer.from([180, 143, 232, 239, 1, 187, 8, 122, 15, 70, 75, 87, 247, 218, 187, 79, 247, 151, 136, 166, 103, 141, 134, 124, 78, 121, 224, 247, 86, 140, 54, 112]);
    const ivBytes = Buffer.from( [62, 206, 37, 107, 88, 68, 129, 60, 230, 170, 133, 194, 247, 188, 44, 143]);
    const algorithm = 'aes-256-cbc';

    try{
        let decipher = crypto.createDecipheriv(algorithm, keyBytes,ivBytes);
        let decrypted = decipher.update(encrypted, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        // console.log("---------Decrypting the data returns the following output-----------")
        // console.log(kdcResponse);
        const kdcResponse = JSON.parse(decrypted);
        const cleanResponse = {
            nonce: kdcResponse.nonce,
            bob: kdcResponse.bob,
            sessionKey: {
                key: Buffer.from(kdcResponse.sessionKey.key.data).toString('hex'),
                iv: Buffer.from(kdcResponse.sessionKey.iv.data).toString('hex')
            },
            ticket: kdcResponse.ticket
        }
        logTitledObject('DECRYPTED RESPONSE FROM KDC', cleanResponse);
        return decrypted;
    }
    catch(e){
        console.error("Error happened when decrypting")
        console.error(e);
        throw e;
    }
}

function sendLastMessageToBob(n3 : string, keyBytes : Buffer, ivBytes : Buffer){
    const algorithm = 'aes-256-cbc';

    //first compute n3 - 1 to send to Bob
    const buff = Buffer.from(n3, 'base64');
    const n3Int = buff.readBigInt64BE(0) - BigInt(1);
    const newBuff = Buffer.allocUnsafe(8);
    newBuff.writeBigInt64BE(n3Int, 0);
    const n3_1 = newBuff.toString('base64');
    // console.log(`Computed n3-1: ${n3_1}` );
    logTitledString('COMPUTED n3 - 1', n3_1);

    //encrypt n3_1 
    let cipher = crypto.createCipheriv(algorithm, keyBytes, ivBytes);
    let encryptedN3_1 = cipher.update(n3, 'base64', 'base64');
    encryptedN3_1 += cipher.final('base64');
    // console.log(`Encrypted n3-1: ${encryptedN3_1}` );
    logTitledString('ENCRYPTED n3 - 1', encryptedN3_1)


    //send it to Bob
    var client = net.connect({host: '127.0.0.1', port: 3000}, function() {
        client.write(encryptedN3_1);
    });

}
function aliceAndBob(kdcResponse : any){
    //first extract the session key
    const keyBytes = Buffer.from(kdcResponse.sessionKey.key.data);
    const ivBytes = Buffer.from(kdcResponse.sessionKey.iv.data);
    const algorithm = 'aes-256-cbc';
    let aliceCipher = crypto.createCipheriv(algorithm, keyBytes, ivBytes);

    //create kAB{n2}
    const n2 = crypto.randomBytes(8).toString('base64');
    let encryptedReply = aliceCipher.update(n2, 'base64', 'base64');
    encryptedReply += aliceCipher.final('base64');

    // console.log("----Alice and Bob communication-------");
    logBreak('ALICE AND BOB COMMUNICATION');
    // console.log("N2 nonce created: " + n2);
    logTitledString('GENERATED NONCE n2', n2);
    // console.log("Encrypted N2: " + encryptedReply);
    logTitledString('ENCRYPTED NONCE n2', encryptedReply);
    
    const toBob = {"n2" : encryptedReply, "ticket" : kdcResponse.ticket};
    // console.log("Sending to Bob: " + JSON.stringify(toBob));
    logTitledObject('SENDING TO BOB', toBob);

    var client = net.connect({host: '127.0.0.1', port: 3000}, function() {
        client.write(JSON.stringify(toBob));
    });

    client.on('data',function(data){
        // console.log("Received from Bob: " + data.toString());
        logTitledJson('RECEIVED FROM BOB', data.toString());
        const fromBob = JSON.parse(data.toString());
        let decipher = crypto.createDecipheriv(algorithm, keyBytes, ivBytes);
        let decryptedN2_1 = decipher.update(fromBob.n2_1, 'base64', 'base64');
        decryptedN2_1 += decipher.final('base64'); 
        // console.log("Decrypted n2 - 1 received from Bob: " + decryptedN2_1);
        logTitledString('EXPECTING n2 - 1 (decrypted response above)', decryptedN2_1);

        //compute the expected n2 - 1
        const buff = Buffer.from(n2, 'base64');
        const n2Int = buff.readBigInt64BE(0) - BigInt(1);
        const newBuff = Buffer.allocUnsafe(8);
        newBuff.writeBigInt64BE(n2Int, 0);
        const n2_1 = newBuff.toString('base64');
        // console.log("Expected n2 - 1: " + n2_1 );
        logTitledString('EXPECTED n2 - 1', n2_1);

        decipher = crypto.createDecipheriv(algorithm, keyBytes, ivBytes);
        let decryptedN3 = decipher.update(fromBob.n3, 'base64', 'base64');
        decryptedN3 += decipher.final('base64'); 
        // console.log(`Decrypted n3: ${decryptedN3}`);
        logTitledString('DECRYPTED n3', decryptedN3);

        sendLastMessageToBob(decryptedN3, keyBytes, ivBytes);
    });
}

const aliceId = "DF72A441-9C8B-484F-A514-35B207DB99FE";
const bobId = "e4b03425-fb42-40d7-8d97-431bd55597d7";



let n1 = crypto.randomBytes(8).toString('base64');
let nB = '';

var client = net.connect({host: '127.0.0.1', port: 3000}, function() {
    // console.log('Asking bob for nonce');
    logTitledString('REQUESTING BOB\'S NONCE', 'I want to talk');
    client.write("I want to talk");
});

client.on('data',function(data){
    nB = JSON.parse(data.toString()).nB;
    let toKDC = JSON.stringify({n1, alice : aliceId, bob : bobId, nB});

    // console.log(toKDC);
    logTitledJson('TO KDC', toKDC);

    (async () => {
        // const encrypted = await request(toKDC, "http://localhost:8787");

    
        const encrypted = await request(toKDC, "http://127.0.0.1:8787");
        // console.log(encrypted);
        logTitledString('ENCRYPTED RESPONSE FROM KDC', encrypted);

        const kdcResponse = JSON.parse(getDecryptedJson(encrypted));

        // console.log("----Verify the nonce-------");
        // console.log("Nonce received from KDC: " + kdcResponse.nonce);
        logTitledString('EXPECTING MY NONCE n1 BACK FROM KDC', kdcResponse.nonce);
        // console.log("Correct nonce: " + n1);
        logTitledString('CORRECT NONCE n1                   ', n1);
        assert(n1 == kdcResponse.nonce);

        aliceAndBob(kdcResponse);
        
    })().catch(e => {
        console.log("Failed contact to KDC");
    });
});




