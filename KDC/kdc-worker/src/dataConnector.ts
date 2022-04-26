import { KeyIv } from './kdc';
// import fetch from 'node-fetch';

type UserData = {
    ID: string,
    IV: {type: string, data: number[]},
    Key: {type: string, data: number[]}
}

export async function getLongTermSecret(user: string): Promise<KeyIv> {
    const body = {ID: user};
    try {
        const response = await fetch('https://distributedkdc.azurewebsites.net/apiold/users/getuser', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const responseObj = await response.json<UserData>();
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