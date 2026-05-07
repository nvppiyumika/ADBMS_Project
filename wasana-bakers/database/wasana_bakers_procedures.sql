-- =======================================================
-- WASANA BAKERS - STORED PROCEDURES
-- =======================================================

-- 1. Get Product Affinity (Market Basket Analysis)
-- Finds top 5 pairs of products frequently bought together

CREATE OR ALTER PROCEDURE GetProductAffinity
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 5
        p1.ProductName AS ProductA, 
        p2.ProductName AS ProductB, 
        COUNT(*) AS Frequency
    FROM SalesDetails sd1
    JOIN SalesDetails sd2 ON sd1.SaleID = sd2.SaleID AND sd1.ProductID < sd2.ProductID
    JOIN Products p1 ON sd1.ProductID = p1.ProductID
    JOIN Products p2 ON sd2.ProductID = p2.ProductID
    GROUP BY p1.ProductName, p2.ProductName
    ORDER BY Frequency DESC;
END;
GO

-- 2. Get Inventory Status (Low Stock Alert)
-- Identifies products with stock levels below 20 units

CREATE OR ALTER PROCEDURE GetInventoryStatus
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ProductName, 
        StockQuantity 
    FROM Products 
    WHERE StockQuantity < 20 
    ORDER BY StockQuantity ASC;
END;
GO

-- 3. Get Sales Summary By Date Range
-- Calculates total revenue and order count for a specific date range

CREATE OR ALTER PROCEDURE GetSalesSummaryByDateRange
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ISNULL(SUM(TotalAmount), 0) AS TotalRevenue, 
        COUNT(*) AS OrderCount 
    FROM Sales 
    WHERE CAST(SaleDate AS DATE) BETWEEN @StartDate AND @EndDate;
END;
GO
