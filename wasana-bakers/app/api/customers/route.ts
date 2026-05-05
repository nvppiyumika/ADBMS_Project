import { connectToDatabase } from '@/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        
        if (!pool) {
            throw new Error('Database connection failed');
        }

        const result = await pool.request().query(`
            SELECT 
                CustomerID, 
                FirstName, 
                LastName, 
                Email, 
                PhoneNumber, 
                JoinedDate, 
                LoyaltyPoints
            FROM Customers
            ORDER BY CustomerID ASC
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
        const { FirstName, LastName, Email, PhoneNumber } = body;

        if (!FirstName || !LastName) {
            return new Response(JSON.stringify({ error: 'First and Last name are required' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        const result = await pool.request()
            .input('FirstName', sql.NVarChar(50), FirstName)
            .input('LastName', sql.NVarChar(50), LastName)
            .input('Email', sql.NVarChar(100), Email || null)
            .input('PhoneNumber', sql.NVarChar(20), PhoneNumber || null)
            .query(`
                INSERT INTO Customers (FirstName, LastName, Email, PhoneNumber, JoinedDate, LoyaltyPoints)
                OUTPUT inserted.CustomerID
                VALUES (@FirstName, @LastName, @Email, @PhoneNumber, GETDATE(), 0)
            `);

        const newCustomerId = result.recordset[0].CustomerID;

        return new Response(JSON.stringify({ message: 'Customer created successfully', CustomerID: newCustomerId }), {
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
        const { CustomerID, FirstName, LastName, Email, PhoneNumber } = body;

        if (!CustomerID || !FirstName || !LastName) {
            return new Response(JSON.stringify({ error: 'CustomerID, FirstName, and LastName are required' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        await pool.request()
            .input('CustomerID', sql.Int, CustomerID)
            .input('FirstName', sql.NVarChar(50), FirstName)
            .input('LastName', sql.NVarChar(50), LastName)
            .input('Email', sql.NVarChar(100), Email || null)
            .input('PhoneNumber', sql.NVarChar(20), PhoneNumber || null)
            .query(`
                UPDATE Customers 
                SET FirstName = @FirstName, 
                    LastName = @LastName, 
                    Email = @Email, 
                    PhoneNumber = @PhoneNumber
                WHERE CustomerID = @CustomerID
            `);

        return new Response(JSON.stringify({ message: 'Customer updated successfully' }), {
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
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return new Response(JSON.stringify({ error: 'Missing customerId parameter' }), { status: 400 });
        }

        const pool = await connectToDatabase();
        if (!pool) throw new Error('Database connection failed');

        // We might need to set CustomerID to NULL in Sales table first, or rely on ON DELETE SET NULL if configured.
        // Let's do it manually just to be safe.
        await pool.request()
            .input('CustomerID', sql.Int, parseInt(customerId))
            .query(`
                UPDATE Sales SET CustomerID = NULL WHERE CustomerID = @CustomerID;
                DELETE FROM Customers WHERE CustomerID = @CustomerID;
            `);

        return new Response(JSON.stringify({ message: 'Customer deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
