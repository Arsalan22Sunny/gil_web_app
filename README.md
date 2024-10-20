# Office Inventory Management System Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Backend (Flask)](#backend-flask)
   - [Configuration](#configuration)
   - [Authentication](#authentication)
   - [API Endpoints](#api-endpoints)
4. [Frontend (React)](#frontend-react)
   - [Components](#components)
   - [State Management](#state-management)
   - [API Integration](#api-integration)
5. [Features](#features)
   - [User Authentication](#user-authentication)
   - [Dashboard](#dashboard)
   - [Inventory Management](#inventory-management)
   - [Analytics](#analytics)
   - [Notifications](#notifications)
6. [Security Considerations](#security-considerations)
7. [Deployment](#deployment)
8. [Future Enhancements](#future-enhancements)
9. [Testing URL](#testing-url)

## 1. Introduction

The Office Inventory Management System is a web-based application designed to help businesses efficiently manage their office supplies and equipment. It provides features for tracking inventory levels, managing stock, analyzing usage patterns, and generating reports.

Key features include:
- User authentication and authorization
- Real-time dashboard with inventory statistics
- Inventory item management (CRUD operations)
- Low stock alerts
- Analytics and reporting
- Mobile-responsive design

## 2. System Architecture

The application follows a client-server architecture:

- Backend: Flask (Python) with MongoDB for data storage
- Frontend: React.js
- Authentication: JWT (JSON Web Tokens)
- API: RESTful API for communication between frontend and backend

## 3. Backend (Flask)

### Configuration

The backend is configured in `main.py`:

- Flask application setup
- CORS (Cross-Origin Resource Sharing) configuration
- MongoDB connection
- JWT configuration

### Authentication

User authentication is implemented using JWT:

- `/api/register`: User registration endpoint
- `/api/login`: User login endpoint
- JWT tokens are used for securing API endpoints

### API Endpoints

The backend provides the following main API endpoints:

- `/api/items`: GET, POST, PUT, DELETE operations for inventory items
- `/api/analytics/low-stock`: Retrieve low stock items
- `/api/analytics/inventory-value`: Get total inventory value
- `/api/analytics/stock-movement`: Get stock movement data
- `/api/notifications`: Manage system notifications
- `/api/categories`: Retrieve available item categories

## 4. Frontend (React)

### Components

The frontend is built using React and consists of several key components:

1. `Auth.jsx`: Handles user registration and login
2. `Dashboard.jsx`: Main dashboard view with inventory overview and charts
3. `InventoryPage.jsx`: Manages inventory items (add, edit, delete)
4. `Sidebar.jsx`: Navigation component

### State Management

- React hooks (`useState`, `useEffect`) are used for local state management
- Context API could be considered for global state management in future iterations

### API Integration

- The `authenticatedFetch` function in `apiUtils.jsx` is used for making authenticated API requests
- This function handles token management and redirects to login if the token is invalid

## 5. Features

### User Authentication

- User registration with email and password
- Login functionality with JWT token generation
- Protected routes requiring authentication

### Dashboard

The dashboard (`Dashboard.jsx`) provides an overview of the inventory system:

- Total items count
- Total inventory value
- Low stock items count
- Number of categories
- Category distribution chart
- Items by category chart
- Recent notifications
- Filtered view of inventory items

### Inventory Management

The inventory page (`InventoryPage.jsx`) allows users to:

- View all inventory items
- Add new items
- Edit existing items
- Delete items
- Filter and search items

### Analytics

Basic analytics are provided:

- Low stock alerts
- Inventory value calculation
- Stock movement trends

### Notifications

- System generates notifications for low stock items
- Users can view and dismiss notifications

## 6. Security Considerations

- JWT is used for secure authentication
- Passwords are hashed before storage
- CORS is configured to restrict access to trusted origins
- Input validation and sanitization should be implemented (currently limited)

## 7. Deployment

The current setup assumes a local development environment:

- Backend: Running on `localhost:5060`
- Frontend: Typically running on `localhost:3000` (default for Create React App)
- MongoDB: Local instance on `localhost:27017`

For production deployment:

- Use environment variables for sensitive information (e.g., JWT secret, database URI)
- Set up HTTPS for secure communication
- Configure proper CORS settings
- Consider using a production-ready web server (e.g., Gunicorn) for the Flask application

## 8. Future Enhancements

Potential areas for improvement:

1. Implement role-based access control (RBAC)
2. Add more advanced analytics and reporting features
3. Integrate with external systems (e.g., procurement, accounting)
4. Implement real-time updates using WebSockets
5. Add unit and integration tests
6. Implement data export functionality
7. Enhance mobile responsiveness and add a dedicated mobile app

This documentation provides an overview of the Office Inventory Management System. For detailed implementation specifics, refer to the individual code files and comments within the source code.

## 9. Testing URL

Deployed Application URL: https://gilarsalan.netlify.app/

username: `arsalansunny.kha@gmail.com`
password: `gil_web_test`
