const sql = require('mssql/msnodesqlv8');
const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

async function check() {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Recipes'");
    console.log(result.recordset);
    process.exit(0);
}
check();
