# MedChain Backend Setup

## Quick Start

The frontend is currently running in demo mode because the backend server is not available. To connect to real data:

### Option 1: Start Backend Server (if available)
```bash
# Navigate to backend directory (if it exists)
cd backend
npm install
npm start
```

### Option 2: Mock Data Mode (Current)
The frontend automatically falls back to mock data when the backend is unavailable. This allows you to:
- ✅ Test the UI and user experience
- ✅ See how the dashboard looks with sample data
- ✅ Navigate through all features
- ✅ Test wallet connection functionality

## Current Status

🟡 **Demo Mode Active** - The frontend is showing mock data for demonstration purposes.

### Mock Data Includes:
- **1,247** Total Medicine Batches
- **23** Registered Manufacturers  
- **3** Recalled Batches
- **15** Expired Scans
- **2** Pending Manufacturer Verifications

## Features Working in Demo Mode

✅ **Wallet Connection** - Multiple wallet detection and selection  
✅ **Role-based Navigation** - Admin, Manufacturer, User views  
✅ **Dashboard UI** - Beautiful, responsive interface  
✅ **Navigation** - All pages accessible  
✅ **Error Handling** - Graceful fallbacks for API errors  

## Next Steps

1. **Connect Wallet** - Test the improved wallet connection system
2. **Explore Dashboards** - Navigate through Admin and Manufacturer views
3. **Test Features** - Try different user roles and permissions
4. **Start Backend** - When ready, start the backend server for real data

## API Endpoints Expected

The frontend expects these endpoints to be available:
- `GET /api/verify/stats/global` - System statistics
- `GET /api/verify/reports/expired` - Expired medicine reports  
- `GET /api/manufacturer?status=unverified` - Pending manufacturer verifications
- `GET /api/manufacturer/{address}` - Manufacturer details
- `POST /api/manufacturer/prepare-register` - Register manufacturer
- `POST /api/manufacturer/prepare-verify` - Verify manufacturer

## Environment Variables

Create a `.env` file in the client directory:
```env
VITE_CHAIN_ID=11155111
VITE_BACKEND_URL=http://localhost:5000
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```
