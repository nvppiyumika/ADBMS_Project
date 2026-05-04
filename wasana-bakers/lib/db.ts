import sql from 'mssql';

const config = {
    // Use the Server Name from your screenshot
    server: 'localhost\\SQLEXPRESS', 
    database: 'BakeryDB', // The name of the DB you created in SSMS
    options: {
        encrypt: true, // Matches "Encrypt: Mandatory" in your image
        trustServerCertificate: true, // Matches the checked box in your image
        enableArithAbort: true
    },
    // For Windows Authentication, we leave user/password out 
    // and rely on the local system account.
    driver: 'msnodesqlv8' 
};

export async function connectToDatabase() {
    try {
        let pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error('Database Connection Failed: ', err);
        throw err;
    }
}
