const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'wasana_bakers',
    options: { trustedConnection: true }
};

async function checkUDFs() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT name, type_desc FROM sys.objects WHERE type IN ('FN', 'IF', 'TF')");
        console.log(JSON.stringify(result.recordset, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkUDFs();
