import { KeyIv } from './kdc';
// import fetch from 'node-fetch';

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
    // const body = {ID: user};
    

    // const response = await fetch('https://distributedkdc.azurewebsites.net/api/users', {
    //     method: 'post',
    //     body: JSON.stringify(body),
    //     headers: {'Content-Type': 'application/json'}
    // });
    // const data: any= await response.json();
    // const obj = data.recordset[0];
    // return {
    //     key: obj.KeyBytes,
    //     iv: obj.IV
    // }
    return new Promise((resolve, reject)=>{
        resolve({
            key: Buffer.from([180, 143, 232, 239, 1, 187, 8, 122, 15, 70, 75, 87, 247, 218, 187, 79, 247, 151, 136, 166, 103, 141, 134, 124, 78, 121, 224, 247, 86, 140, 54, 112]),
            iv: Buffer.from([62, 206, 37, 107, 88, 68, 129, 60, 230, 170, 133, 194, 247, 188, 44, 143])
        });
    });
}