import * as crypto from 'crypto';
const req = {
    alice: "DF72A441-9C8B-484F-A514-35B207DB99FE",
    bob: "e4b03425-fb42-40d7-8d97-431bd55597d7",
    n1: "KeUkb+0eu97Dz0hO3BGpJw==",
    nB: "jgq7FL9GgmPGpJljGqsXCg=="
}

let decipher = crypto.createDecipheriv(algorithm, bobKey.key, bobKey.iv);
let nonce = decipher.update(req.nB, 'base64', 'base64');
nonce += decipher.final('base64');