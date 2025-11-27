# MedChain Backend Setup Guide

## 🚀 Quick Start

Currently, the MedChain frontend operates in a **demonstration mode** when the backend server is unavailable. This ensures that users can explore the application's features and UI without requiring a full local backend setup.

### Option 1: Full Local Setup (Recommended for Development)

To connect to the real backend and blockchain data:

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

### Option 2: Demonstration Mode

If the backend server is not detected, the frontend automatically falls back to mock data. This mode allows you to:

*   ✅ **Test the User Interface**: Experience the dashboard layout and responsiveness.
*   ✅ **Visualize Data**: View sample data for batches, manufacturers, and reports.
*   ✅ **Navigate Features**: Access all application pages and workflows.
*   ✅ **Simulate Wallet Connection**: Test the wallet integration UI.

## 📊 Current System Status

> 🟡 **Status**: Demo Mode Active
>
> The frontend is currently serving mock data for demonstration purposes.

### Mock Data Overview
*   **Total Medicine Batches**: 1,247
*   **Registered Manufacturers**: 23
*   **Recalled Batches**: 3
*   **Expired Scans**: 15
*   **Pending Verifications**: 2

## 🌟 Available Features in Demo Mode

| Feature | Status | Description |
| :--- | :---: | :--- |
| **Wallet Connection** | ✅ | Detects and connects to available Web3 wallets. |
| **Role-Based Access** | ✅ | Simulates Admin, Manufacturer, and User perspectives. |
| **Dashboard UI** | ✅ | Fully interactive and responsive charts/tables. |
| **Navigation** | ✅ | Seamless routing between all application sections. |
| **Error Handling** | ✅ | Graceful fallbacks for missing API endpoints. |

## ⏭️ Next Steps

1.  **Connect Wallet**: Use the "Connect Wallet" button to test the integration.
2.  **Explore Dashboards**: Switch between user roles to see different views.
3.  **Test Workflows**: Simulate the verification and registration processes.
4.  **Launch Backend**: Follow "Option 1" above to enable real-time data.

## 🔌 API Endpoint Reference

The frontend is configured to communicate with the following endpoints:

*   `GET /api/verify/stats/global` - Retrieve global system statistics.
*   `GET /api/verify/reports/expired` - Fetch expired medicine reports.
*   `GET /api/manufacturer?status=unverified` - List pending manufacturer verifications.
*   `GET /api/manufacturer/{address}` - Get specific manufacturer details.
*   `POST /api/manufacturer/prepare-register` - Initiate manufacturer registration.
*   `POST /api/manufacturer/prepare-verify` - Submit manufacturer verification.

## ⚙️ Environment Configuration

Ensure your client environment is configured correctly by creating a `.env` file in the `client` directory:

```env
VITE_CHAIN_ID=11155111
VITE_BACKEND_URL=http://localhost:5000
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```
