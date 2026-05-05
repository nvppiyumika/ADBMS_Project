export interface Category {
    CategoryID: number;
    CategoryName: string;
}

export interface Product {
    ProductID: number;
    ProductName: string;
    CategoryID?: number;
    UnitPrice: number;
    ReorderLevel?: number;
}

export interface Ingredient {
    IngredientID: number;
    IngredientName: string;
    StockQuantity: number;
    UnitOfMeasure: string;
}

export interface Recipe {
    ProductID: number;
    IngredientID: number;
    QuantityRequired: number;
}

export interface Customer {
    CustomerID: number;
    FirstName: string;
    LastName: string;
    Email?: string;
    PhoneNumber?: string;
    JoinedDate?: Date;
    LoyaltyPoints: number;
}

export interface Sale {
    SaleID: number;
    SaleDate?: Date;
    TotalAmount?: number;
    CustomerID?: number;
}

export interface SalesDetail {
    SalesDetailID: number;
    SaleID?: number;
    ProductID?: number;
    Quantity: number;
    SubTotal?: number;
}

export interface ProductAffinity {
    ProductA: string;
    ProductB: string;
    Frequency: number;
}

export interface InventoryStatus {
    ProductName: string;
    StockQuantity: number;
}

export interface SalesSummary {
    TotalRevenue: number;
    OrderCount: number;
}
