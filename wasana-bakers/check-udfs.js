const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

async function checkUDFs() {
    try {
        console.log('Connecting to database...');
        await sql.connect(config);
        
        console.log('\n--- 1. Testing fn_GetProductInventoryValue ---');
        const res1 = await sql.query`SELECT TOP 1 ProductID, ProductName, dbo.fn_GetProductInventoryValue(ProductID) as Value FROM Products`;
        if (res1.recordset.length > 0) {
            console.log(`✅ Success! Product: ${res1.recordset[0].ProductName}, Calculated Value: ${res1.recordset[0].Value}`);
        } else {
            console.log('⚠️ No products found to test.');
        }

        console.log('\n--- 2. Testing fn_GetLowStockProducts ---');
        const res2 = await sql.query`SELECT * FROM dbo.fn_GetLowStockProducts()`;
        console.log(`✅ Success! Found ${res2.recordset.length} items currently below reorder level.`);

        console.log('\n--- 3. Testing fn_FormatDate ---');
        const res3 = await sql.query`SELECT dbo.fn_FormatDate(GETDATE()) as FormattedDate`;
        console.log(`✅ Success! Current Date Formatted: ${res3.recordset[0].FormattedDate}`);

        console.log('\n--- 4. Testing fn_GetCustomerLoyaltyLevel ---');
        const res4 = await sql.query`SELECT TOP 1 CustomerID, FirstName, dbo.fn_GetCustomerLoyaltyLevel(CustomerID) as Level FROM Customers`;
        if (res4.recordset.length > 0) {
            console.log(`✅ Success! Customer: ${res4.recordset[0].FirstName}, Loyalty Level: ${res4.recordset[0].Level}`);
        } else {
            console.log('⚠️ No customers found to test.');
        }

        console.log('\n🚀 ALL FUNCTIONS ARE WORKING PERFECTLY!\n');

    } catch (err) {
        console.error('\n❌ ERROR FOUND:');
        console.error(err.message);
        console.log('\nTip: Make sure you have executed the SQL script in SSMS before running this check.');
    } finally {
        await sql.close();
    }
}

checkUDFs();
