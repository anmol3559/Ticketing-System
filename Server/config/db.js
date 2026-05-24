const sql = require('mssql');
const config = {
    server : process.env.DB_SERVER || "LAPTOP-5QG9K7F8\\SQLEXPRESS",
    database : process.env.DB_NAME || "TicketingDB",
    options:{
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true

    }
};

let pool;
async function connectDB(){
    try{
        pool = await sql.connect(config);
        console.log("Connected to the database");
    }
    catch(err){
        console.error("Database connection failed: ", err);
        process.exit(1);
    }
}

async function getpool(){
    if(!pool) await connectDB();
    return pool;
}

module.exports = {
  connectDB,  getpool , sql
};