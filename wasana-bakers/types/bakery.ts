export interface Product {
    ProductID: number;
    Name: string;
    Description?: string;
    Price: number;
    CategoryID?: number;
    StockQuantity: number;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}

export interface Ingredient {
    IngredientID: number;
    Name: string;
    QuantityInStock: number;
    Unit: string;
    ReorderLevel?: number;
}

export interface ProductAffinity {
    ProductA: string;
    ProductB: string;
    Frequency: number;
}
