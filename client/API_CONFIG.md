# API Configuration Guide

## Environment-Based API Configuration

This project uses environment variables to manage API URLs for different deployment environments.

### Files Overview

#### `.env.development`
- **When used**: Automatically loaded during `npm run dev`
- **API URL**: `http://localhost:4000` (Local development server)
- **Purpose**: Local development and testing

#### `.env.production`
- **When used**: Automatically loaded during `npm run build` and production deployments
- **API URL**: `https://ravi-maligai.onrender.com` (Deployed backend on Render)
- **Purpose**: Production deployment

#### `src/api.js`
- **Purpose**: Centralized API client with axios instance
- **Features**:
  - Uses `import.meta.env.VITE_API_URL` to dynamically set the API base URL
  - Automatic error handling with meaningful error messages
  - Organized by domain: `products`, `dashboard`, `cart`, `invoices`, `sales`, `reports`
  - Built-in request/response handling with proper status code checking

#### `src/socket.js`
- **Purpose**: WebSocket connection for real-time updates
- **Features**:
  - Connects to the same API URL (with fallback to localhost)
  - Automatic reconnection with exponential backoff
  - Connection event logging for debugging

### How It Works

1. **Development (`npm run dev`)**
   - Loads `.env.development`
   - VITE_API_URL = http://localhost:4000
   - Backend must be running locally
   - Vite proxy middleware handles /api requests
   - Socket.io connects to localhost

2. **Production Build (`npm run build`)**
   - Loads `.env.production`
   - VITE_API_URL = https://ravi-maligai.onrender.com
   - API client points to deployed backend
   - Socket.io connects to Render deployment
   - No proxy middleware (direct CORS requests)

3. **Production Deployment**
   - Build output includes environment variables
   - All API requests go directly to Render
   - No local server proxying needed

### Using the API Client

```javascript
import { products, dashboard, sales, reports, cart, invoices } from '../api';

// Get all products
const productsList = await products.getAll();

// Create new product
const newProduct = await products.create({
  name: "Product Name",
  sku: "SKU123",
  price: 100,
  qty: 50
});

// Get dashboard stats
const stats = await dashboard.getStats();

// Checkout
const result = await cart.checkout(items, customer);

// Get sales history
const history = await sales.getHistory(query, fromDate, toDate);

// Get sales report
const report = await reports.getSalesReport(fromDate, toDate, 'day');
```

### Error Handling

All API functions use proper error handling:

```javascript
try {
  const data = await products.getAll();
  // Handle success
} catch (error) {
  console.error(error.message); // Meaningful error message
}
```

### Vite Configuration

Proxy middleware is configured for development:
```javascript
// vite.config.js
proxy: {
  '/api': 'http://localhost:4000'
}
```

This means in development, requests to `/api/*` are proxied to localhost:4000, but the API client now uses the full base URL for maximum flexibility.

### CORS Configuration

**Important**: Ensure your backend (Render) has CORS enabled for production:

```javascript
// Backend (server/index.js)
app.use(cors({
  origin: 'https://your-frontend-url.vercel.app', // or your actual frontend URL
  credentials: true
}));
```

### Deployment Checklist

- [ ] Backend deployed on Render with CORS enabled
- [ ] `.env.production` has correct Render URL
- [ ] `.env.development` has correct local development URL
- [ ] Build process includes environment variables
- [ ] Test API calls in production before deploying
- [ ] Monitor backend logs for API issues
- [ ] Verify socket.io connections in console

### Troubleshooting

**Issue**: API calls fail in production
- Check `.env.production` has correct URL
- Verify CORS is enabled on backend
- Check network tab for actual API URL being used
- Ensure backend is running and accessible

**Issue**: Socket connections fail
- Check `src/socket.js` initialization
- Verify backend socket.io server is running
- Check browser console for connection errors

**Issue**: Proxy not working in development
- Ensure backend is running on port 4000
- Check `vite.config.js` proxy configuration
- Try accessing http://localhost:4000 directly
