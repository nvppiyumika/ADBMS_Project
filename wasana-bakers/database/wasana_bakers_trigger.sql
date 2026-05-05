-- =======================================================
-- 1. DATABASE SCHEMA UPDATES
-- =======================================================

-- Add the StockQuantity column to the Products table so it can hold finished goods inventory
ALTER TABLE Products 
ADD StockQuantity INT NOT NULL DEFAULT 0;
GO

-- Create the ProductBakeLog table to securely track baking history
-- This acts as the event that triggers our inventory math
CREATE TABLE ProductBakeLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    QuantityBaked INT NOT NULL,
    BakeDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO

-- =======================================================
-- 2. TRIGGER: Baking Products (Increases Product, Decreases Ingredients)
-- =======================================================

CREATE OR ALTER TRIGGER trg_AfterBakeProduct
ON ProductBakeLog
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Step A: Increase Finished Product Stock
    -- Joins the newly inserted bake log rows with the Products table
    UPDATE p
    SET p.StockQuantity = p.StockQuantity + baked.TotalBaked
    FROM Products p
    INNER JOIN (
        SELECT ProductID, SUM(QuantityBaked) as TotalBaked
        FROM inserted
        GROUP BY ProductID
    ) AS baked ON p.ProductID = baked.ProductID;

    -- Step B: Decrease Raw Ingredient Stock based on Recipes
    -- Joins the inserted bake log rows with the Recipes table to calculate exact material usage
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
GO

-- =======================================================
-- 3. TRIGGER: Selling Products (Decreases Product Stock)
-- =======================================================

CREATE OR ALTER TRIGGER trg_AfterInsertSalesDetails
ON SalesDetails
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Update the StockQuantity in the Products table.
    -- (Ingredients are NOT deducted here, because they were already deducted during baking)
    UPDATE p
    SET p.StockQuantity = p.StockQuantity - usage.TotalQuantity
    FROM Products p
    INNER JOIN (
        SELECT ProductID, SUM(Quantity) as TotalQuantity
        FROM inserted
        GROUP BY ProductID
    ) AS usage ON p.ProductID = usage.ProductID;
END;
GO
