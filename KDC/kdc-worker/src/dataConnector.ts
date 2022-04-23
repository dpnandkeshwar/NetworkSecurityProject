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
    const body = {ID: user};
    // const ENC_KEY = Buffer.from('f1ed01c4f55def71bcc224b061d901ce2797b1d2a9a2d9f29b1b2cfd4d4fd2ac', 'hex');
    // const IV = Buffer.from("9ba6c0af38bc092afdd9cf746b138de9", 'hex');
    try {
        const response = await fetch('https://distributedkdc.azurewebsites.net/apiold/users/getuser', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        console.log("It worked!!")
        console.log(await response.text());
    }
    catch (e) {
        console.log("Error happened")
        console.log(e);
    }
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