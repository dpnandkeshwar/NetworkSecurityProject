import { assert } from 'console';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

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
    console.log("---------Encrypted  json received from the KDC ------------")
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
        let decrypted = decipher.update(encrypted, 'base64', 'base64');
        decrypted += decipher.final('base64');
        console.log("---------Decrypting the data returns the following output-----------")
        let kdcResponse = Buffer.from(decrypted, 'base64').toString('utf8');
        console.log(kdcResponse);
        return kdcResponse;
    }
    catch(e){
        console.error("Error happened when decrypting")
        console.error(e);
        throw e;
    }
}

function aliceAndBob(kdcResponse : any){
    //first extract the session key
    const keyBytes = Buffer.from(kdcResponse.sessionKey.key.data);
    const ivBytes = Buffer.from(kdcResponse.sessionKey.iv.data);
    const algorithm = 'aes-256-cbc';
    let aliceCipher = crypto.createCipheriv(algorithm, keyBytes, ivBytes);

    //create kAB{n2}
    const n2 = crypto.randomBytes(8).toString('base64');
    let encryptedReply = aliceCipher.update(n2.toString(), 'utf-8', 'base64');
    encryptedReply += aliceCipher.final('base64');

    console.log("----Alice and Bob communication-------");
    console.log("N2 nonce created: " + n2);
    console.log("Encrypted N2: " + encryptedReply);
    
    const toBob = {"n2" : encryptedReply, "ticket" : kdcResponse.ticket};
    console.log("Sending to Bob: " + JSON.stringify(toBob));
}

const aliceId = "DF72A441-9C8B-484F-A514-35B207DB99FE";
const bobId = "e4b03425-fb42-40d7-8d97-431bd55597d7";
const nB = 'UFO6tb28ok2lX58T5/bvmg==';
let n1 = crypto.randomBytes(8).toString('base64');

let toKDC = JSON.stringify({n1, alice : aliceId, bob : bobId, nB});

console.log(toKDC);

(async () => {
    // const encrypted = await request(toKDC, "http://localhost:8787");

    const encrypted = await request(toKDC, "http://127.0.0.1:8787");
    console.log(encrypted);

    const kdcResponse = JSON.parse(getDecryptedJson(encrypted));

    console.log("----Verify the nonce-------");
    console.log("Nonce received from KDC: " + kdcResponse.nonce);
    console.log("Correct nonce: " + n1);
    assert(n1 == kdcResponse.nonce);

    aliceAndBob(kdcResponse);
    
})().catch(e => {
    console.log("Failed contact to KDC");
});
