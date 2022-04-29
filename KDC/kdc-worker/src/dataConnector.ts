import { KeyIv } from './kdc';
import * as crypto from 'crypto';
import { algorithm } from './constants';
import { logTitledObject } from './outputUtil';

type UserData = {
    ID: string,
    IV: {type: string, data: number[]},
    Key: {type: string, data: number[]}
}

export async function getLongTermSecret(user: string): Promise<KeyIv> {
    const ENC_KEY = Buffer.from('f1ed01c4f55def71bcc224b061d901ce2797b1d2a9a2d9f29b1b2cfd4d4fd2ac', 'hex');
    const IV = Buffer.from("9ba6c0af38bc092afdd9cf746b138de9", 'hex');

    const body = { ID: user };
    const bodyJson = JSON.stringify(body);
    let dataCipher = crypto.createCipheriv(algorithm, ENC_KEY, IV);
    let encryptedBody = dataCipher.update(bodyJson, 'utf-8', 'base64');
    encryptedBody += dataCipher.final('base64');
    const wrappedData = { data: encryptedBody };
    logTitledObject('DATABASE REQUEST OBJECT', wrappedData);

    try {
        const response = await fetch('https://distributedkdc.azurewebsites.net/api/users/getuser', {
            method: 'POST',
            body: JSON.stringify(wrappedData),
            headers: {'Content-Type': 'application/json'}
        });
        // const responseObj = await response.json<UserData>();
        const responseObjWrapped = await response.json<{data: string}>();
        let dataDecipher = crypto.createDecipheriv(algorithm, ENC_KEY, IV);
        let decryptedBody = dataDecipher.update(responseObjWrapped.data, 'base64', 'utf-8');
        decryptedBody += dataDecipher.final('utf-8');
        const responseObj = JSON.parse(decryptedBody);
        const returnObj = {
            key: Buffer.from(responseObj.Key.data),
            iv: Buffer.from(responseObj.IV.data)
        };
        return returnObj;
    }
    catch (e) {
        console.error("Error happened")
        console.error(e);
        throw e;
    }
}