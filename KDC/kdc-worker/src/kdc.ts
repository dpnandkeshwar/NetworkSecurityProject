import * as crypto from 'crypto';

export function getKdcResponse(nonce: String, user: String, requested: String, encryptedNonce: String)  {
    const userKey = getLongTermSecret(user);
    const requestedKey = getLongTermSecret(requested);

    let reqDecipher = crypto.createDecipheriv('aes-256-cbc', requestedKey.key, requestedKey.iv);
    // let reqNonce = reqDecipher.update(Buffer.from(encryptedNonce), 'base64', 'base64');
}

function getLongTermSecret(user: String): { key: Buffer, iv: Buffer } {
    // Add in data for getting the user's key
    
    const key: Buffer = Buffer.from('rawkeyinBase64', 'base64');
    const iv: Buffer = Buffer.from('rawIVinBase64', 'base64');
    return {key, iv};
}