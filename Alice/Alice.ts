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
const nB = 'UFO6tb28ok2lX58T5/bvmg==';
let n1 = crypto.randomBytes(8).toString('base64');

let toKDC = JSON.stringify({n1, alice : aliceId, bob : bobId, nB});

console.log(toKDC);


request(toKDC, "http://localhost:8787");
