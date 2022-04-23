const express = require('express');
const crypto = require('crypto');
const sql = require('mssql');
const app = express()
app.use(express.json());

const ENC_KEY = Buffer.from('f1ed01c4f55def71bcc224b061d901ce2797b1d2a9a2d9f29b1b2cfd4d4fd2ac', 'hex');
const IV = Buffer.from("9ba6c0af38bc092afdd9cf746b138de9", 'hex');
console.log(ENC_KEY);
console.log(IV);


const sqlConfig = {
    user: 'dpnandkeshwar',
    password: 'Dhanpaul2000',
    database: 'KDCDatabase',
    server: 'cs6490project.database.windows.net',
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: false // change to true for local dev / self-signed certs
    },
  };

var port = process.env.PORT || 3000;
app.listen(port, () => console.log('App running on port: ' + port));


/**
 * Expecting JSON Object of the form
 * object = {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: { 'ID' : <uuid>}
 * }
 */
app.post('/api/users/getuser', (req, res) => {
    let request = req.body;
    let query = getUser(request.ID);
    query.then(function(result) {

      try {
        let record = result.recordset[0];
        let jsonReturn = JSON.stringify({ ID : record.ID , Key : record.KeyBytes, IV : record.IV});

        let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
        let encrypted = cipher.update(jsonReturn, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        res.send(encrypted);
      }
      catch(error) {
        console.error(error);
      }
    })
});

app.put('/api/users/updateblocks'), (req, res) => {
  let request = req.body;
  let query = updateBlocks(request.ID, request.blockNum);
  query.then(function(result) {
    if(result.rowsAffected[0] == 1)
      res.send(JSON.stringify({ success: 'true'}));
    else
      res.send(JSON.stringify({ success: 'false'}));
  })
}

async function getUser(ID) {
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().input('id', sql.UniqueIdentifier, ID).query('SELECT * FROM Clients where ID = @id');
    return result;
}

// Doesn't work needs to update blocks not reset 
async function updateBlocks(ID, blockNum) {
  let pool = await sql.connect(sqlConfig);
  let result = pool.request();
  result.input('id', sql.UniqueIdentifier, ID);
  result.input('blockNum', sql.Int, blockNum);
  await result.query('UPDATE [dbo].[Clients] set blocksEncrypted = @blockNum WHERE ID = @id');
}