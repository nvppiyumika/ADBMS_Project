import { connectToDatabase } from '@/lib/db';
import sql from 'mssql/msnodesqlv8';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ProductID, QuantityBaked } = body;

        if (!ProductID || !QuantityBaked || QuantityBaked <= 0) {
            return new Response(JSON.stringify({ error: 'Invalid product or quantity' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) {
            throw new Error('Database connection failed');
        }

        // Inserting into ProductBakeLog fires trg_AfterBakeProduct automatically!
        await pool.request()
            .input('ProductID', sql.Int, ProductID)
            .input('QuantityBaked', sql.Int, QuantityBaked)
            .query(`
                INSERT INTO ProductBakeLog (ProductID, QuantityBaked, BakeDate)
                VALUES (@ProductID, @QuantityBaked, GETDATE())
            `);

        return new Response(JSON.stringify({ message: 'Successfully baked product and updated inventory!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
