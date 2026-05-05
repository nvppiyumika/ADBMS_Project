import { connectToDatabase } from '@/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        
        if (!pool) {
            throw new Error('Database connection failed');
        }

        const result = await pool.request().query(`
            SELECT 
                p.ProductID, 
                p.ProductName, 
                p.CategoryID,
                c.CategoryName, 
                p.UnitPrice, 
                p.ReorderLevel,
                p.StockQuantity
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            ORDER BY p.ProductID ASC
        `);
        
        return new Response(JSON.stringify(result.recordset), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

import sql from 'mssql/msnodesqlv8';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ProductName, CategoryID, UnitPrice, ReorderLevel } = body;

        if (!ProductName || UnitPrice === undefined) {
            return new Response(JSON.stringify({ error: 'ProductName and UnitPrice are required' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        const result = await pool.request()
            .input('ProductName', sql.NVarChar(100), ProductName)
            .input('CategoryID', sql.Int, CategoryID || null)
            .input('UnitPrice', sql.Decimal(10, 2), UnitPrice)
            .input('ReorderLevel', sql.Int, ReorderLevel || 10)
            .query(`
                INSERT INTO Products (ProductName, CategoryID, UnitPrice, ReorderLevel, StockQuantity)
                OUTPUT inserted.ProductID, inserted.ProductName
                VALUES (@ProductName, @CategoryID, @UnitPrice, @ReorderLevel, 0)
            `);

        return new Response(JSON.stringify({ message: 'Product created successfully', product: result.recordset[0] }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { ProductID, ProductName, CategoryID, UnitPrice, ReorderLevel } = body;

        if (!ProductID || !ProductName || UnitPrice === undefined) {
            return new Response(JSON.stringify({ error: 'ProductID, ProductName and UnitPrice are required' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        await pool.request()
            .input('ProductID', sql.Int, ProductID)
            .input('ProductName', sql.NVarChar(100), ProductName)
            .input('CategoryID', sql.Int, CategoryID || null)
            .input('UnitPrice', sql.Decimal(10, 2), UnitPrice)
            .input('ReorderLevel', sql.Int, ReorderLevel || 10)
            .query(`
                UPDATE Products 
                SET ProductName = @ProductName, 
                    CategoryID = @CategoryID, 
                    UnitPrice = @UnitPrice, 
                    ReorderLevel = @ReorderLevel
                WHERE ProductID = @ProductID
            `);

        return new Response(JSON.stringify({ message: 'Product updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
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
            .query(`DELETE FROM Products WHERE ProductID = @ProductID`);

        return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
