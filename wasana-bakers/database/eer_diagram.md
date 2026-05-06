# Wasana Bakers - EER Diagram

This diagram represents the logical structure of your database, including entities, their attributes, and the relationships between them.

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ RECIPES : "uses"
    INGREDIENTS ||--o{ RECIPES : "included_in"
    CUSTOMERS ||--o{ SALES : "makes"
    SALES ||--|{ SALES_DETAILS : "has"
    PRODUCTS ||--o{ SALES_DETAILS : "sold_as"
    PRODUCTS ||--o{ PRODUCT_BAKE_LOG : "tracked_in"

    CATEGORIES {
        int CategoryID PK
        string CategoryName
    }

    PRODUCTS {
        int ProductID PK
        string ProductName
        int CategoryID FK
        decimal UnitPrice
        int ReorderLevel
        int StockQuantity
    }

    INGREDIENTS {
        int IngredientID PK
        string IngredientName
        string UnitOfMeasure
        int StockQuantity
    }

    RECIPES {
        int ProductID PK, FK
        int IngredientID PK, FK
        decimal QuantityRequired
    }

    CUSTOMERS {
        int CustomerID PK
        string FirstName
        string LastName
        string Email
        string PhoneNumber
    }

    SALES {
        int SaleID PK
        datetime SaleDate
        decimal TotalAmount
        int CustomerID FK
    }

    SALES_DETAILS {
        int SaleDetailID PK
        int SaleID FK
        int ProductID FK
        int Quantity
        decimal SubTotal
    }

    PRODUCT_BAKE_LOG {
        int LogID PK
        int ProductID FK
        int QuantityBaked
        datetime BakeDate
    }
```

## Key Relationships Explained:
1. **Products & Categories**: Many-to-One. Each product belongs to one category, but a category can have many products.
2. **Products & Ingredients (via Recipes)**: Many-to-Many. A product (like a Cake) uses many ingredients, and one ingredient (like Flour) can be used in many products.
3. **Sales & Customers**: One-to-Many. A customer can have many sales, but a sale is linked to one customer (or is a walk-in).
4. **Sales & Products (via SalesDetails)**: Many-to-Many. A sale can contain multiple products, and a product can appear in multiple sales.
5. **Product Bake Log**: Tracks whenever a product is baked, which triggers the inventory updates you implemented!
