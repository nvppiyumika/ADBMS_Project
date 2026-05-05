const sql = require('mssql/msnodesqlv8');
const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

async function update() {
    try {
        let pool = await sql.connect(config);
        
        // Ensure no duplicate rows exist before adding Primary Key
        await pool.request().query(`
            WITH CTE AS (
                SELECT ProductID, IngredientID, 
                ROW_NUMBER() OVER(PARTITION BY ProductID, IngredientID ORDER BY (SELECT NULL)) as row_num
                FROM Recipes
            )
            DELETE FROM CTE WHERE row_num > 1;
        `);

        // Try adding the Primary Key (Ignore if already exists)
        try {
            await pool.request().query(`
                ALTER TABLE Recipes
                ADD CONSTRAINT PK_Recipes PRIMARY KEY CLUSTERED (ProductID, IngredientID);
            `);
            console.log("Added Composite Primary Key to Recipes table.");
        } catch(e) {
            console.log("Primary key likely already exists or couldn't be added:", e.message);
        }

        console.log("Schema Update Complete!");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
update();
