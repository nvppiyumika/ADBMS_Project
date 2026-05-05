import { connectToDatabase } from '@/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        
        if (!pool) {
            throw new Error('Database connection failed');
        }

        const result = await pool.request().query(`
            SELECT 
                IngredientID, 
                IngredientName, 
                UnitOfMeasure AS Unit, 
                StockQuantity, 
                50 AS ReorderLevel -- Default ReorderLevel since it doesn't exist in DB
            FROM Ingredients
            ORDER BY IngredientID ASC
        `);
        
        return new Response(JSON.stringify(result.recordset), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
