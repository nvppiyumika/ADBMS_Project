const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=BakeryDB;Trusted_Connection=yes;Encrypt=no;'
};

async function createTrigger() {
    try {
        let pool = await sql.connect(config);
        
        const sqlBatch = `
        -- 1. Add StockQuantity to Products if it doesn't exist
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'StockQuantity')
        BEGIN
            ALTER TABLE Products ADD StockQuantity INT NOT NULL DEFAULT 0;
        END

        -- 2. Create ProductBakeLog table if it doesn't exist
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('ProductBakeLog') AND type in (N'U'))
        BEGIN
            CREATE TABLE ProductBakeLog (
                LogID INT IDENTITY(1,1) PRIMARY KEY,
                ProductID INT NOT NULL,
                QuantityBaked INT NOT NULL,
                BakeDate DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
            );
        END
        `;

        await pool.request().batch(sqlBatch);
        console.log('Successfully updated Database Schema!');

        // 3. Update Sales Trigger (Deducts from Products instead of Ingredients)
        const salesTriggerSQL = `
        CREATE OR ALTER TRIGGER trg_AfterInsertSalesDetails
        ON SalesDetails
        AFTER INSERT
        AS
        BEGIN
            SET NOCOUNT ON;

            UPDATE p
            SET p.StockQuantity = p.StockQuantity - usage.TotalQuantity
            FROM Products p
            INNER JOIN (
                SELECT ProductID, SUM(Quantity) as TotalQuantity
                FROM inserted
                GROUP BY ProductID
            ) AS usage ON p.ProductID = usage.ProductID;
        END;
        `;
        await pool.request().batch(salesTriggerSQL);
        console.log('Successfully recreated Sales Trigger!');

        // 4. Create Baking Trigger (Increases Product Stock, Decreases Ingredient Stock)
        const bakeTriggerSQL = `
        CREATE OR ALTER TRIGGER trg_AfterBakeProduct
        ON ProductBakeLog
        AFTER INSERT
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Step A: Increase Product Stock
            UPDATE p
            SET p.StockQuantity = p.StockQuantity + baked.TotalBaked
            FROM Products p
            INNER JOIN (
                SELECT ProductID, SUM(QuantityBaked) as TotalBaked
                FROM inserted
                GROUP BY ProductID
            ) AS baked ON p.ProductID = baked.ProductID;

            -- Step B: Decrease Ingredient Stock based on Recipes
            UPDATE i
            SET i.StockQuantity = i.StockQuantity - usage.TotalIngredientUsed
            FROM Ingredients i
            INNER JOIN (
                SELECT 
                    r.IngredientID,
                    SUM(ins.QuantityBaked * r.QuantityRequired) as TotalIngredientUsed
                FROM inserted ins
                INNER JOIN Recipes r ON ins.ProductID = r.ProductID
                GROUP BY r.IngredientID
            ) AS usage ON i.IngredientID = usage.IngredientID;
        END;
        `;
        await pool.request().batch(bakeTriggerSQL);
        console.log('Successfully created Baking Trigger!');

        process.exit(0);
    } catch (err) {
        console.error('Failed to update schema and triggers:', err);
        process.exit(1);
    }
}

createTrigger();
