-- =======================================================
-- USER DEFINED FUNCTIONS (UDFs) FOR WASANA BAKERS
-- =======================================================

-- 1. SCALAR FUNCTION: Calculate Total Inventory Value for a Product
-- This function takes a ProductID and returns the total market value of the current stock.

CREATE FUNCTION dbo.fn_GetProductInventoryValue (@ProductID INT)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @TotalValue DECIMAL(18, 2);
    
    SELECT @TotalValue = StockQuantity * UnitPrice 
    FROM Products 
    WHERE ProductID = @ProductID;
    
    RETURN ISNULL(@TotalValue, 0);
END;
GO

-- 2. SCALAR FUNCTION: Get Customer Loyalty Level
-- Categorizes customers based on their total spending.

CREATE FUNCTION dbo.fn_GetCustomerLoyaltyLevel (@CustomerID INT)
RETURNS VARCHAR(20)
AS
BEGIN
    DECLARE @TotalSpent DECIMAL(18, 2);
    DECLARE @Level VARCHAR(20);
    
    SELECT @TotalSpent = SUM(TotalAmount) 
    FROM Sales 
    WHERE CustomerID = @CustomerID;
    
    IF @TotalSpent >= 10000 SET @Level = 'Platinum';
    ELSE IF @TotalSpent >= 5000 SET @Level = 'Gold';
    ELSE IF @TotalSpent >= 1000 SET @Level = 'Silver';
    ELSE SET @Level = 'Bronze';
    
    RETURN @Level;
END;
GO

-- 3. TABLE-VALUED FUNCTION: Get Products Below Reorder Level
-- Returns a table of all products that need restocking.

CREATE FUNCTION dbo.fn_GetLowStockProducts ()
RETURNS TABLE
AS
RETURN (
    SELECT ProductID, ProductName, StockQuantity, ReorderLevel
    FROM Products
    WHERE StockQuantity <= ReorderLevel
);
GO

-- 4. SCALAR FUNCTION: Format Date to Wasana Standard (DD/MM/YYYY)
-- Ensures consistent date formatting across all DB views and reports.

CREATE FUNCTION dbo.fn_FormatDate (@InputDate DATETIME)
RETURNS VARCHAR(10)
AS
BEGIN
    RETURN CONVERT(VARCHAR(10), @InputDate, 103);
END;
GO
