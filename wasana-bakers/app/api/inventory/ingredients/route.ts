import { connectToDatabase } from '@/lib/db';
import sql from 'mssql/msnodesqlv8';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        const result = await pool.request().query(`
            SELECT 
                IngredientID, 
                IngredientName, 
                UnitOfMeasure AS Unit, 
                StockQuantity, 
                20 AS ReorderLevel
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

export async function POST(request: Request) {
    try {
        const { IngredientName, Unit, StockQuantity } = await request.json();
        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        await pool.request()
            .input('Name', sql.VarChar(100), IngredientName)
            .input('Unit', sql.VarChar(20), Unit)
            .input('Stock', sql.Int, StockQuantity)
            .query(`
                INSERT INTO Ingredients (IngredientName, UnitOfMeasure, StockQuantity)
                VALUES (@Name, @Unit, @Stock)
            `);

        return new Response(JSON.stringify({ message: 'Ingredient added' }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { IngredientID, IngredientName, Unit, StockQuantity } = await request.json();
        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        await pool.request()
            .input('ID', sql.Int, IngredientID)
            .input('Name', sql.VarChar(100), IngredientName)
            .input('Unit', sql.VarChar(20), Unit)
            .input('Stock', sql.Int, StockQuantity)
            .query(`
                UPDATE Ingredients 
                SET IngredientName = @Name, UnitOfMeasure = @Unit, StockQuantity = @Stock
                WHERE IngredientID = @ID
            `);

        return new Response(JSON.stringify({ message: 'Ingredient updated' }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM Ingredients WHERE IngredientID = @ID');

        return new Response(JSON.stringify({ message: 'Ingredient deleted' }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
