import { connectToDatabase } from '@/lib/db';
import { ProductAffinity } from '@/types/bakery';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        
        if (!pool) {
            throw new Error('Database connection failed');
        }

        // This executes the "GetProductAffinity" procedure for your assignment
        const result = await pool.request().execute('GetProductAffinity');
        
        // Map the result to our strongly typed interface
        const affinities: ProductAffinity[] = result.recordset;
        
        return new Response(JSON.stringify(affinities), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
