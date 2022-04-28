import * as net from 'net'
import * as crypto from 'crypto';
import { assert } from 'console';

const PORT = 3000
const IP = '127.0.0.1'
const BACKLOG = 100

let nB = "";
let n3 = "";
let sessionKeyBytes = Buffer.from('placeholder');
let sessionIvBytes = Buffer.from('placeholder');
let messageCount = 0;
const keyBytes = Buffer.from([78,245,194,90,252,102,103,133,187,206,169,71,5,241,58,116,16,54,38,197,234,147,61,179,85,227,172,153,84,237,84,100]);
const ivBytes = Buffer.from( [163,73,171,188,125,180,71,194,181,240,50,165,60,219,166,216]);
const algorithm = 'aes-256-cbc';

let server = net.createServer()
.listen(PORT, IP, BACKLOG)
.on('connection', socket => socket  
    .on('data', buffer => {
        const request = buffer.toString();
        if(messageCount == 0){
            let nbBytes = crypto.randomBytes(8);
            nB = nbBytes.toString('base64');
            let bobCipher = crypto.createCipheriv(algorithm, keyBytes, ivBytes);
            let encryptedReply = bobCipher.update(nB, 'base64', 'base64');
            encryptedReply += bobCipher.final('base64');
            
            console.log("----Alice and Bob communication-------");
            console.log("nB nonce created: " + nbBytes.toString('base64'));
            console.log("Encrypted nB: " + encryptedReply);
                
            const toAlice = {"nB" : encryptedReply};
            console.log("Sending to Alice: " + JSON.stringify(toAlice));  

            socket.write(JSON.stringify(toAlice));
            messageCount++;
        }
        else if (messageCount == 1) {
            console.log("----Receiving ticketed message----");
            assert(nB != "");
            const fromAlice = JSON.parse(request);
            const encryptedN2 = fromAlice.n2;
            const encryptedTicket = fromAlice.ticket;
            let decipher = crypto.createDecipheriv(algorithm, keyBytes,ivBytes);
            let decrypted = decipher.update(encryptedTicket, 'base64', 'base64');
            decrypted += decipher.final('base64'); 

            const ticketString = Buffer.from(decrypted, 'base64').toString('utf8');
            console.log("Bob ticket: " + ticketString);
            const ticket = JSON.parse(ticketString);

            const encryptedNB = ticket.nonce;
            console.log("nB extracted from ticket: " + encryptedNB);


            //extract the session key
            sessionKeyBytes = Buffer.from(ticket.sessionKey.key.data);
            sessionIvBytes = Buffer.from(ticket.sessionKey.iv.data);

            decipher = crypto.createDecipheriv(algorithm, sessionKeyBytes,sessionIvBytes);
            let decryptedN2 = decipher.update(encryptedN2, 'base64', 'base64');
            decryptedN2 += decipher.final('base64'); 
            console.log("Decrypted n2 from ticket: " + decryptedN2);
            
            //subtract 1 from n2
            const buff = Buffer.from(decryptedN2, 'base64');
            const n2Int = buff.readBigInt64BE(0) - BigInt(1);
            const newBuff = Buffer.allocUnsafe(8);
            newBuff.writeBigInt64BE(n2Int, 0);
            const n2_1 = newBuff.toString('base64');
            console.log("computed n2 - 1 displayed as base64 string: " + n2_1 );

            let bobCipher = crypto.createCipheriv(algorithm, sessionKeyBytes, sessionIvBytes);
            let encryptedN2_1 = bobCipher.update(n2_1, 'base64', 'base64');
            encryptedN2_1 += bobCipher.final('base64');
            //construct message with n2 -1 and n3

            n3 = crypto.randomBytes(8).toString('base64');
            bobCipher = crypto.createCipheriv(algorithm, sessionKeyBytes, sessionIvBytes);
            let encryptedN3 = bobCipher.update(n3, 'base64', 'base64');
            encryptedN3 += bobCipher.final('base64');

            console.log("created nonce n3 displayed as base64 string: " + n3 );

            const toAlice = JSON.stringify({"n2_1" : encryptedN2_1 , "n3" : encryptedN3});
           
            socket.write(toAlice);
            messageCount++;
        }
        else if(messageCount == 2){
            console.log("----Receiving n3-1 from Alice----");
            assert(n3 != "");
            //decrypte the n3_1 from Alice
            const fromAlice = request;
            let decipher = crypto.createDecipheriv(algorithm, sessionKeyBytes,sessionIvBytes);
            let decryptedN3_1 = decipher.update(fromAlice, 'base64', 'base64');
            decryptedN3_1 += decipher.final('base64'); 
            console.log("Decrypted n3-1 from Alice: " + decryptedN3_1);

            //subtract 1 from n3
            const buff = Buffer.from(n3, 'base64');
            const n3Int = buff.readBigInt64BE(0) - BigInt(1);
            const newBuff = Buffer.allocUnsafe(8);
            newBuff.writeBigInt64BE(n3Int, 0);
            const n3_1 = newBuff.toString('base64');
            console.log(`Expected n3-1 as: ${n3_1}` );
            process.exit(0);

        }

    }));

