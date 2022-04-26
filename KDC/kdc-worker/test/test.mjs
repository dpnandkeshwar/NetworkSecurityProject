import * as crypto from 'crypto';
const algorithm = 'aes-256-cbc';

// const bobKey = {
//     key: Buffer.from([78,245,194,90,252,102,103,133,187,206,169,71,5,241,58,116,16,54,38,197,234,147,61,179,85,227,172,153,84,237,84,100]),
//     iv: Buffer.from([163,73,171,188,125,180,71,194,181,240,50,165,60,219,166,216])
// }

let bobKey = JSON.parse('{"key":{"type":"Buffer","data":[78,245,194,90,252,102,103,133,187,206,169,71,5,241,58,116,16,54,38,197,234,147,61,179,85,227,172,153,84,237,84,100]},"iv":{"type":"Buffer","data":[163,73,171,188,125,180,71,194,181,240,50,165,60,219,166,216]}}');
bobKey.key = Buffer.from(bobKey.key.data);
bobKey.iv = Buffer.from(bobKey.iv.data);
console.log(bobKey)
console.log(bobKey.iv.length);

let plainnonce = crypto.randomBytes(8).toString('base64');
console.log(`input:      ${plainnonce}`);
let cipher = crypto.createCipheriv(algorithm, bobKey.key, bobKey.iv);
let ciphertext = cipher.update(plainnonce, 'base64', 'base64');
ciphertext += cipher.final('base64');

console.log(`ciphertext: ${ciphertext}`);

const req = {
    alice: "DF72A441-9C8B-484F-A514-35B207DB99FE",
    bob: "e4b03425-fb42-40d7-8d97-431bd55597d7",
    n1: "KeUkb+0eu97Dz0hO3BGpJw==",
    nB: ciphertext
}

let decipher = crypto.createDecipheriv(algorithm, bobKey.key, bobKey.iv);
let nonce = decipher.update(req.nB, 'base64', 'base64');
nonce += decipher.final('base64');
console.log(`output:     ${nonce}`);