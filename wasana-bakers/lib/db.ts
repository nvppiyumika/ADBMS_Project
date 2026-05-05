import sql from 'mssql/msnodesqlv8';
import { ConnectionPool } from 'mssql';

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

export async function connectToDatabase(): Promise<ConnectionPool> {
    try {
        // @ts-ignore - The mssql typings don't know that msnodesqlv8 accepts connectionString in the config object
        let pool = await sql.connect(config);
        return pool as unknown as ConnectionPool;
    } catch (err) {
        console.error('Database Connection Failed: ', err);
        throw err;
    }
}
