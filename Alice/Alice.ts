import * as crypto from 'crypto';
import fetch from 'node-fetch';

// type AliceToKDC = { n1: string, alice: string, bob : string,  nB : string};

async function request(toKDC : string, url : string) : Promise<String> {    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        },
        body: toKDC
    });
    const body = await response.text();
    console.log(body);
    return body
}



const aliceId = "DF72A441-9C8B-484F-A514-35B207DB99FE";
const bobId = "e4b03425-fb42-40d7-8d97-431bd55597d7";
const keyBytes = Buffer.from([180, 143, 232, 239, 1, 187, 8, 122, 15, 70, 75, 87, 247, 218, 187, 79, 247, 151, 136, 166, 103, 141, 134, 124, 78, 121, 224, 247, 86, 140, 54, 112]);
const ivBytes = Buffer.from( [62, 206, 37, 107, 88, 68, 129, 60, 230, 170, 133, 194, 247, 188, 44, 143]);
const algorithm = 'aes-256-cbc';
let n1 = crypto.randomBytes(16).toString('base64');

// let cipher = crypto.createCipheriv(algorithm, keyBytes, ivBytes);
// let encrypted = cipher.update("hello world", 'utf-8', 'base64');
// encrypted += cipher.final('base64');

//todo: get this nonce from bob
let nB = crypto.randomBytes(16).toString('base64');
let toKDC = JSON.stringify({n1, aliceId, bobId, nB});

console.log(toKDC);


request(toKDC, "http://kdc-worker.architmenon-mnn.workers.dev");
