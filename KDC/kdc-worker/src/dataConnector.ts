import { KeyIv } from './kdc';
import fetch from 'node-fetch';

type UserData = {
    recordsets: [
        [
            {
                ID: string,
                BlocksEncrypted: 0,
                KeyBytes: Buffer,
                IV: Buffer
            }
        ]
    ],
    recordset: [
        {
            ID: string,
            BlocksEncrypted: 0,
            KeyBytes: Buffer,
            IV: Buffer
        }
    ],
    output: {},
    rowsAffected: number[]
}

export async function getLongTermSecret(user: string): Promise<KeyIv> {
    const body = {ID: user};
    

    const response = await fetch('https://distributedkdc.azurewebsites.net/api/users', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });
    const data: any= await response.json();
    const obj = data.recordset[0];
    return {
        key: obj.KeyBytes,
        iv: obj.IV
    }
}