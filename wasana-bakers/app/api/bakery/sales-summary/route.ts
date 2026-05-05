import { connectToDatabase } from '@/lib/db';
import sql from 'mssql/msnodesqlv8';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('startDate');
        const end = searchParams.get('endDate');

        if (!start || !end) {
            throw new Error('StartDate and EndDate are required');
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        const result = await pool.request()
            .input('StartDate', sql.Date, start)
            .input('EndDate', sql.Date, end)
            .execute('GetSalesSummaryByDateRange');
        
        return new Response(JSON.stringify(result.recordset[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
