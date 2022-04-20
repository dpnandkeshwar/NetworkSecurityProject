const express = require('express');
const sql = require('mssql');
const app = express()

const sqlConfig = {
    user: 'dpnandkeshwar',
    password: 'Dhanpaul2000',
    database: 'node-mssql',
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
app.get('/', (req, res) => res.send('IS WORKING?'));
app.listen(port, () => console.log('App running on port: ' + port));