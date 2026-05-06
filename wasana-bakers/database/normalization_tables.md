# Normalized Table Lists - Wasana Bakers

This document outlines the database schema organized into normalized tables, ensuring data integrity and reducing redundancy.

## 1. Categorization & Products
These tables separate category descriptions from individual product details.

### Table: Categories
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| CategoryID | INT | PK | Unique identifier for the category |
| CategoryName | VARCHAR(50) | | Name of the category (e.g., Bread, Pastry) |

### Table: Products
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| ProductID | INT | PK | Unique identifier for the product |
| ProductName | VARCHAR(100) | | Name of the bakery product |
| CategoryID | INT | FK | Link to the Categories table |
| UnitPrice | DECIMAL(10,2) | | Selling price per unit |
| ReorderLevel | INT | | Stock level that triggers a restock alert |
| StockQuantity | INT | | Current finished goods in stock |

---

## 2. Ingredients & Production
Handles the raw materials and the "Recipes" that link them to products.

### Table: Ingredients
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| IngredientID | INT | PK | Unique identifier for the ingredient |
| IngredientName | VARCHAR(100) | | Name of the raw material |
| UnitOfMeasure | VARCHAR(20) | | Measurement unit (kg, L, units) |
| StockQuantity | INT | | Current raw material stock level |

### Table: Recipes (Junction Table)
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| ProductID | INT | PK, FK | Link to the Products table |
| IngredientID | INT | PK, FK | Link to the Ingredients table |
| QuantityRequired | DECIMAL(10,3) | | Amount of ingredient needed for 1 unit of product |

---

## 3. Sales & Customers
Separates customer identity from specific transaction details.

### Table: Customers
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| CustomerID | INT | PK | Unique identifier for the customer |
| FirstName | VARCHAR(50) | | Customer's first name |
| LastName | VARCHAR(50) | | Customer's last name |
| Email | VARCHAR(100) | | Contact email address |
| PhoneNumber | VARCHAR(20) | | Contact phone number |

### Table: Sales
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| SaleID | INT | PK | Unique identifier for the sale |
| SaleDate | DATETIME | | Date and time of the transaction |
| TotalAmount | DECIMAL(10,2) | | Total value of the sale |
| CustomerID | INT | FK | Link to the Customers table (NULL for walk-ins) |

### Table: SalesDetails (Junction Table)
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| SaleDetailID | INT | PK | Unique identifier for the line item |
| SaleID | INT | FK | Link to the Sales table |
| ProductID | INT | FK | Link to the Products table |
| Quantity | INT | | Number of units sold |
| SubTotal | DECIMAL(10,2) | | Price * Quantity for this item |

---

## 4. History & Logging

### Table: ProductBakeLog
| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| LogID | INT | PK | Unique identifier for the log entry |
| ProductID | INT | FK | Link to the Products table |
| QuantityBaked | INT | | Number of units produced |
| BakeDate | DATETIME | | When the production occurred |

---

## Normalization Analysis
*   **1NF (First Normal Form)**: All columns contain atomic values, and there are no repeating groups.
*   **2NF (Second Normal Form)**: All non-key attributes are fully functional dependent on the primary key (achieved by moving Recipes and SalesDetails to separate junction tables).
*   **3NF (Third Normal Form)**: No transitive dependencies exist. For example, `CategoryName` is in its own table rather than in `Products`, so it only depends on `CategoryID`.
