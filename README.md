# Schoolsite Backend (Server)

This repository contains the backend server for the Schoolsite application. It is built with **Node.js**, **Express**, and **TypeScript**, and uses **MySQL** for the database.

## Project Structure

- `server/`: Contains the main server logic, routes, and database connection.
- `shared/`: Contains shared constants and types used by both the server and frontend.
- `package.json`: Defines project dependencies and scripts.

## Getting Started

### Prerequisites

- Node.js (version 18+)
- MySQL database

### Installation

1.  **Clone the repository** (once it's a separate repo).
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Configure environment variables**:
    Create a `.env` file in the root directory based on the existing `server/.env` file and update the database connection details.

### Running the Server

- **Development**:
  ```bash
  pnpm run dev
  ```
- **Production Build**:
  ```bash
  pnpm run build
  ```
- **Start Production Server**:
  ```bash
  pnpm run start
  ```

## API Endpoints

(To be documented based on the `server/routes` files)
