# MedChain Backend Server

This is the backend API server for the MedChain application that reads data directly from the blockchain contracts.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file with:
   ```env
   PORT=5000
   CHAIN_ID=11155111
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
   INFURA_API_KEY=your_infura_api_key_here
   MEDCHAIN_CONTRACT=0x0000000000000000000000000000000000000000
   ```

3. **Start Server**
   ```bash
   npm run backend
   ```

## API Endpoints

- `GET /health` - Health check
- `GET /api/verify/stats/global` - Global system statistics
- `GET /api/manufacturer/:address` - Get manufacturer details
- `GET /api/manufacturer` - Get manufacturer list (with filters)
- `GET /api/verify/reports/expired` - Get expired medicine reports

## Configuration

### Required Environment Variables

- `PORT` - Server port (default: 5000)
- `CHAIN_ID` - Blockchain chain ID (default: 11155111 for Sepolia)
- `RPC_URL` - Ethereum RPC endpoint
- `MEDCHAIN_CONTRACT` - Deployed MedChain contract address

### Optional Environment Variables

- `INFURA_API_KEY` - Infura API key for RPC access
- `MANUFACTURER_REGISTRY_CONTRACT` - Manufacturer registry contract address

## Contract Deployment

Before the backend can serve real data, you need to:

1. **Deploy Contracts** to Sepolia testnet
2. **Update Contract Addresses** in `.env` file
3. **Fund Contract** with some ETH for gas
4. **Register Test Data** through the frontend

## Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Start production server
npm start
```

## Troubleshooting

### Common Issues

1. **Contract not deployed**: Update `MEDCHAIN_CONTRACT` in `.env`
2. **RPC errors**: Check your Infura API key and RPC URL
3. **No data**: Deploy contracts and register test manufacturers/batches

### Error Messages

- `Contract not deployed`: Contract address is not configured
- `Failed to fetch stats`: Blockchain connection or contract call failed
- `Manufacturer not found`: Address is not registered as manufacturer

## Next Steps

1. Deploy MedChain contracts to Sepolia
2. Update contract addresses in `.env`
3. Register test manufacturers and batches
4. Test API endpoints
5. Connect frontend to real data
