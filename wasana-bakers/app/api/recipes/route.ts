import { connectToDatabase } from '@/lib/db';
import sql from 'mssql/msnodesqlv8';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        // Fetch the flat list of all recipe rows joined with Products and Ingredients
        const result = await pool.request().query(`
            SELECT 
                r.ProductID,
                p.ProductName,
                r.IngredientID,
                i.IngredientName,
                r.QuantityRequired,
                i.UnitOfMeasure
            FROM Recipes r
            INNER JOIN Products p ON r.ProductID = p.ProductID
            INNER JOIN Ingredients i ON r.IngredientID = i.IngredientID
            ORDER BY p.ProductName ASC, i.IngredientName ASC
        `);

        // Group the flat list into a structured JSON array
        const recipesMap = new Map();

        result.recordset.forEach(row => {
            if (!recipesMap.has(row.ProductID)) {
                recipesMap.set(row.ProductID, {
                    ProductID: row.ProductID,
                    ProductName: row.ProductName,
                    Ingredients: []
                });
            }
            
            recipesMap.get(row.ProductID).Ingredients.push({
                IngredientID: row.IngredientID,
                IngredientName: row.IngredientName,
                QuantityRequired: row.QuantityRequired,
                UnitOfMeasure: row.UnitOfMeasure
            });
        });

        const formattedRecipes = Array.from(recipesMap.values());

        return new Response(JSON.stringify(formattedRecipes), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function POST(request: Request) {
    let pool;
    let transaction;
    try {
        const body = await request.json();
        const { ProductID, Ingredients } = body; // Ingredients should be an array of { IngredientID, QuantityRequired }

        if (!ProductID || !Ingredients || Ingredients.length === 0) {
            return new Response(JSON.stringify({ error: 'ProductID and at least one Ingredient are required.' }), { status: 400 });
        }

        pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // Step 1: Delete any existing recipe lines for this Product
            await request.query(`DELETE FROM Recipes WHERE ProductID = ${ProductID}`);

            // Step 2: Insert the new recipe lines
            for (const ing of Ingredients) {
                const insertReq = new sql.Request(transaction);
                await insertReq.query(`
                    INSERT INTO Recipes (ProductID, IngredientID, QuantityRequired)
                    VALUES (${ProductID}, ${ing.IngredientID}, ${ing.QuantityRequired})
                `);
            }

            await transaction.commit();

            return new Response(JSON.stringify({ message: 'Recipe successfully saved!' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (txError) {
            await transaction.rollback();
            throw txError;
        }

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return new Response(JSON.stringify({ error: 'Missing productId parameter' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        await pool.request()
            .input('ProductID', sql.Int, parseInt(productId))
            .query(`DELETE FROM Recipes WHERE ProductID = @ProductID`);

        return new Response(JSON.stringify({ message: 'Recipe deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
