import * as crypto from 'crypto';
import { getLongTermSecret } from './dataConnector';

export async function getKdcResponse(nonce: string, user: string, requested: string, encryptedNonce: string): Promise<{data: string}>  {
    // get keys for alice and bob
    const aliceKey = await getLongTermSecret(user);
    const bobKey = await getLongTermSecret(requested);
    const algorithm = 'aes-256-cbc';

    const sessionKey = makeSessionKey();
    const bobNonce = getDecryptedNonce(algorithm, bobKey, encryptedNonce);
    const ticketToBob = formBobTicket(algorithm, bobKey, sessionKey, user, bobNonce);
    const reply = {
        nonce,
        bob: requested,
        sessionKey,
        ticket: ticketToBob
    };
    const replyJson = JSON.stringify(reply);
    let aliceCipher = crypto.createCipheriv(algorithm, aliceKey.key, aliceKey.iv);
    let encryptedReply = aliceCipher.update(replyJson, 'utf-8', 'base64');
    encryptedReply += aliceCipher.final('base64');
    return { data: encryptedReply };
}

export type KeyIv = { key: Buffer, iv: Buffer };

function makeSessionKey(): KeyIv {
    const sessionKey = {
        key: Buffer.from(crypto.randomBytes(32)),
        iv: Buffer.from(crypto.randomBytes(16))
    }
    console.debug("\x1b[34msession key\x1b[0m", JSON.stringify(sessionKey));
    return sessionKey;
}

function getDecryptedNonce(algorithm: string, bobKey: KeyIv, encryptedNonce: string): string {
    let decipher = crypto.createDecipheriv(algorithm, bobKey.key, bobKey.iv);
    let nonce = decipher.update(encryptedNonce, 'base64', 'base64');
    nonce += decipher.final('base64');
    console.debug("\x1b[34mdecrypted nonce (base64):\x1b[0m", nonce);
    return nonce;
}

function formBobTicket(algorithm: string, bobKey: KeyIv, sessionKey: KeyIv, user: string, decryptedNonce: string): string {
    const ticket = {
        sessionKey,
        alice: user,
        nonce: decryptedNonce
    };
    const ticketJson = JSON.stringify(ticket);
    console.debug("\x1b[34mticket\x1b[0m", ticketJson);

    let bobCipher = crypto.createCipheriv(algorithm, bobKey.key, bobKey.iv);
    let ticketEncrypted = bobCipher.update(ticketJson, 'utf-8', 'base64');
    ticketEncrypted += bobCipher.final('base64');
    return ticketEncrypted;
}