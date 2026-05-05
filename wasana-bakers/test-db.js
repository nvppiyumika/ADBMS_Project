const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

async function testConnection() {
    try {
        let pool = await sql.connect(config);
        await pool.request().query("DROP TRIGGER IF EXISTS trg_AfterInsertSalesDetails;");
        console.log("Dropped the duplicate trigger trg_AfterInsertSalesDetails.");
        
        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
}

testConnection();
