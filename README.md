# Prince Educational Supply Inventory System

A full-stack inventory management and invoicing system built for educational supply distribution. It handles product catalog management, invoice generation and payment tracking, supplier restocking, purchase orders, and customer/employee administration — all backed by role-based access control.

---

## Table of Contents

- [Purpose](#purpose)
- [Features](#features)
- [Tech Stack](#tech-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running with Docker (Recommended)](#running-with-docker-recommended)
  - [Running Locally (Without Docker)](#running-locally-without-docker)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Default Ports](#default-ports)

---

## Purpose

Prince Inventory System is designed to digitize and streamline the day-to-day operations of an educational supply business. It provides staff with tools to manage stock levels, generate customer invoices, track payments, place supplier purchase orders, and process incoming restocks — replacing manual spreadsheet-based workflows with a centralized, role-controlled platform.

---

## Features

### Inventory Management

- Add, edit, and categorize products by brand, category, and variant
- Track stock levels per product
- Assign products to unit-of-measure presets for standardized pricing
- Benchmark pricing across suppliers via unit conversion presets
- Mark favorite inventory items per user

### Invoicing

- Create customer invoices with line items and discounts
- Track invoice balances and payment status
- Record partial or full payments against invoices
- Export invoices as PDF documents
- View outstanding receivables per customer

### Restocking

- Create restock orders with multiple supplier batches per order
- Restock using unit presets or directly from purchase orders
- Track restock batches and inventory updates
- Void/cancel restocks

### Purchase Orders

- Generate purchase orders for suppliers
- Track PO status and link restocks to POs
- View all purchase orders with filtering

### Supplier Management

- Manage supplier pricing per product and unit preset
- View restock history per supplier
- Compare supplier pricing for benchmarking

### Customer Management

- Manage customer accounts and payment terms
- View full invoice history per customer
- Customer receivables summary

### Employee Management

- View invoices and restocks processed by each employee

### User & Role Management

- Create and manage user accounts with assigned roles
- Role-based access control (Admin, Manager, Employee, Customer)
- Change passwords and edit user details
- Audit trail for deleted users

### Unit of Measure

- Define custom units (e.g., kg, box, pack)
- Create multi-level unit conversion presets
- Assign products to presets with preset-specific pricing

---

## Tech Stack

### Backend

| Technology                       | Version | Purpose                                             |
| -------------------------------- | ------- | --------------------------------------------------- |
| **ASP.NET Core**                 | 9.0     | Web API framework                                   |
| **Entity Framework Core**        | 9.0.1   | ORM and database migrations                         |
| **SQL Server**                   | 2019    | Relational database                                 |
| **ASP.NET Core Identity**        | 9.0.1   | User authentication and role management             |
| **JWT Bearer Authentication**    | 9.0.1   | Stateless token-based auth                          |
| **Newtonsoft.Json**              | 13.0.3  | JSON serialization with circular reference handling |
| **Scalar.AspNetCore**            | 2.1.1   | Interactive API documentation UI                    |
| **Microsoft.AspNetCore.OpenApi** | 9.0.1   | OpenAPI spec generation                             |

### Frontend

| Technology                 | Version | Purpose                                 |
| -------------------------- | ------- | --------------------------------------- |
| **React**                  | 19.0.0  | UI library                              |
| **TypeScript**             | ~5.7.2  | Type safety                             |
| **Vite + SWC**             | 6.2.0   | Build tool and dev server               |
| **TanStack Router**        | 1.117.1 | File-based client-side routing          |
| **TanStack Query**         | 5.74.7  | Server state management and caching     |
| **Axios**                  | 1.8.4   | HTTP client for API requests            |
| **React Hook Form**        | 7.54.2  | Form state management                   |
| **Yup**                    | 1.6.1   | Schema-based form validation            |
| **Tailwind CSS**           | 4.0.17  | Utility-first CSS framework             |
| **Radix UI**               | 1.4.3   | Accessible headless UI primitives       |
| **lucide-react**           | 0.562.0 | Icon library                            |
| **jsPDF**                  | 4.2.1   | Client-side PDF generation for invoices |
| **sonner**                 | 2.0.7   | Toast notifications                     |
| **date-fns**               | 4.1.0   | Date formatting and utilities           |
| **react-day-picker**       | 9.14.0  | Date picker component                   |
| **next-themes**            | 0.4.6   | Light/dark theme management             |
| **Jest + Testing Library** | 29.7.0  | Unit and component testing              |

---

## Project Structure

```
prince-inventory-system-dotnet/
├── backend/                   # ASP.NET Core 9 Web API
│   ├── Controller/            # REST API controllers grouped by domain
│   │   ├── Auth/              # Login and registration
│   │   ├── Inventory/         # Products, brands, categories, variants
│   │   ├── InvoiceControllers/# Invoices and payments
│   │   ├── RestockControllers/# Restocking operations
│   │   ├── PurchaseOrderControllers/
│   │   ├── Suppliers/
│   │   ├── Customers/
│   │   ├── Employees/
│   │   ├── Users/
│   │   ├── UnitOfMeasure/
│   │   └── UnitPreset/
│   ├── Data/                  # ApplicationDBContext and seeders
│   ├── Models/                # Entity models
│   ├── Dtos/                  # Request/response DTOs
│   ├── Interface/             # Service interfaces
│   ├── Service/               # Business logic services
│   ├── Migrations/            # EF Core database migrations
│   ├── Program.cs             # App entry point and service configuration
│   └── Dockerfile
├── frontend/                  # React + TypeScript SPA
│   ├── src/
│   │   ├── features/          # Domain feature modules
│   │   │   ├── inventory/
│   │   │   ├── invoice/
│   │   │   ├── restock/
│   │   │   ├── purchase-order/
│   │   │   ├── customers/
│   │   │   ├── employees/
│   │   │   ├── suppliers/
│   │   │   └── unit-of-measure/
│   │   └── pages/             # Route-level page components
│   └── Dockerfile
├── docker-compose.yml         # Production compose
└── docker-compose.dev.yml     # Development compose with hot-reload
```

---

## Getting Started

### Prerequisites

**With Docker:**

- Docker and Docker Compose

**Without Docker:**

- .NET SDK 9.0+
- Node.js 20+
- SQL Server instance

---

### Running with Docker (Recommended)

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd prince-inventory-system-dotnet
   ```

2. **Create a `.env` file in the project root:**

   ```env
   DB_PASSWORD=YourStrongPassword123!
   ```

3. **Start all services:**

   **Development** (hot-reload for both frontend and backend):

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   **Production** (optimized static builds):

   ```bash
   docker-compose up --build -d
   ```

4. **The backend will automatically apply database migrations on startup.** Wait for the backend container to finish initializing before using the app.

---

### Running Locally (Without Docker)

You will need a running SQL Server instance. Update the connection string in `backend/appsettings.Development.json`.

**Backend:**

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet watch run
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

| Variable                               | Description                             | Required     |
| -------------------------------------- | --------------------------------------- | ------------ |
| `DB_PASSWORD`                          | SQL Server SA password (used in Docker) | Yes (Docker) |
| `ConnectionStrings__DefaultConnection` | Full SQL Server connection string       | Yes (local)  |
| `JwtSettings__Issuer`                  | JWT token issuer                        | Yes          |
| `JwtSettings__Audience`                | JWT token audience                      | Yes          |
| `JwtSettings__SigningKey`              | JWT signing secret                      | Yes          |

JWT settings are configured via `appsettings.json` / `appsettings.Development.json` or environment variables.

---

## API Documentation

When running in `Development` mode, the interactive API documentation (Scalar UI) is available at:

```
http://localhost:5055/scalar/v1
```

---

## Default Ports

| Service     | Port   |
| ----------- | ------ |
| Frontend    | `8080` |
| Backend API | `5055` |
| SQL Server  | `1433` |
