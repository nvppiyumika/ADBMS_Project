import { connectToDatabase } from '@/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        
        if (!pool) {
            throw new Error('Database connection failed');
        }

        // Query to get recent sales along with the customer's name
        const result = await pool.request().query(`
            SELECT 
                s.SaleID, 
                s.SaleDate, 
                s.TotalAmount, 
                c.FirstName + ' ' + c.LastName AS CustomerName
            FROM Sales s
            LEFT JOIN Customers c ON s.CustomerID = c.CustomerID
            ORDER BY s.SaleID ASC
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
    let pool;
    let transaction;
    try {
        const body = await request.json();
        const { CustomerID, Items, TotalAmount } = body;

        if (!Items || Items.length === 0) {
            return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
        }

        pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Create the Sale record
            const saleReq = new sql.Request(transaction);
            let customerVal = CustomerID ? CustomerID : 'NULL';
            const salesResult = await saleReq.query(`
                INSERT INTO Sales (SaleDate, TotalAmount, CustomerID)
                OUTPUT inserted.SaleID
                VALUES (GETDATE(), ${TotalAmount}, ${customerVal})
            `);
            const saleID = salesResult.recordset[0].SaleID;

            // 2. Insert all SalesDetails (This will automatically fire trg_AfterInsertSalesDetails!)
            for (const item of Items) {
                const detailReq = new sql.Request(transaction);
                await detailReq.query(`
                    INSERT INTO SalesDetails (SaleID, ProductID, Quantity, SubTotal)
                    VALUES (${saleID}, ${item.ProductID}, ${item.Quantity}, ${item.SubTotal})
                `);
            }

            await transaction.commit();

            return new Response(JSON.stringify({ message: 'Sale successful! Inventory automatically updated.', SaleID: saleID }), {
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
    let pool;
    let transaction;
    try {
        const { searchParams } = new URL(request.url);
        const saleId = searchParams.get('saleId');

        if (!saleId) {
            return new Response(JSON.stringify({ error: 'Missing saleId parameter' }), { status: 400 });
        }

        pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const req = new sql.Request(transaction);
            await req.input('SaleID', sql.Int, parseInt(saleId)).query(`
                DELETE FROM SalesDetails WHERE SaleID = @SaleID;
                DELETE FROM Sales WHERE SaleID = @SaleID;
            `);

            await transaction.commit();

            return new Response(JSON.stringify({ message: 'Sale deleted successfully. Inventory was NOT adjusted.' }), {
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
