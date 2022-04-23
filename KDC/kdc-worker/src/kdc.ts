import * as crypto from 'crypto';
import { getLongTermSecret } from './dataConnector';

export async function getKdcResponse(nonce: string, user: string, requested: string, encryptedNonce: string): Promise<string>  {
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
    return encryptedReply;
}

export type KeyIv = { key: Buffer, iv: Buffer };

function makeSessionKey(): KeyIv {
    return {
        key: crypto.randomBytes(32),
        iv: crypto.randomBytes(16)
    }
}

function getDecryptedNonce(algorithm: string, bobKey: KeyIv, encryptedNonce: string): string {
    let decipher = crypto.createDecipheriv(algorithm, bobKey.key, bobKey.iv);
    let nonce = decipher.update(encryptedNonce, 'base64', 'base64');
    nonce += decipher.final('base64');
    return nonce;
}

function formBobTicket(algorithm: string, bobKey: KeyIv, sessionKey: KeyIv, user: string, decryptedNonce: string): string {
    const ticket = {
        sessionKey,
        alice: user,
        nonce: decryptedNonce
    };
    const ticketJson = JSON.stringify(ticket);

    let bobCipher = crypto.createCipheriv(algorithm, bobKey.key, bobKey.iv);
    let ticketEncrypted = bobCipher.update(ticketJson, 'utf-8', 'base64');
    ticketEncrypted += bobCipher.final('base64');
    return ticketEncrypted;
}