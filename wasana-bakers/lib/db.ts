import sql from 'mssql/msnodesqlv8';
import { ConnectionPool } from 'mssql';

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

let cachedPool: ConnectionPool | null = null;

export async function connectToDatabase(): Promise<ConnectionPool> {
    if (cachedPool) return cachedPool;

    try {
        // @ts-ignore - The mssql typings don't know that msnodesqlv8 accepts connectionString in the config object
        const pool = await sql.connect(config);
        cachedPool = pool as unknown as ConnectionPool;
        return cachedPool;
    } catch (err) {
        console.error('Database Connection Failed: ', err);
        throw err;
    }
}
