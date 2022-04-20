const express = require('express');
const sql = require('mssql');
const app = express()
app.use(express.json());

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
app.post('/api/users', (req, res) => {
    let request = req.body;
    let query = getUser(request.ID);
    query.then(function(result) {
        res.send(result);
    })
});

async function getUser (ID) {
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().input('id', sql.UniqueIdentifier, ID).query('SELECT * FROM Clients where ID = @id');
    return result;
}