# MedChain

Secure, on-chain medicine batch registration and verification.

This repository contains a full-stack dApp:

- Frontend: React + Vite + Wagmi + Viem (Connect wallet, verify batches, manage manufacturers)
- Backend: Node/Express + Viem (read-only blockchain queries, REST API consumed by the frontend)

---

## Quick Start

Prerequisites:

- Node.js 18+ and npm
- An Ethereum RPC endpoint (e.g., Infura) for the backend to read the blockchain

1) Configure environment variables

- Frontend
  - Copy `client/.env.example` to `client/.env.development` (Vite dev) and fill values if needed.
  - We already added the following contract addresses for you:
    - `VITE_MEDCHAIN_ADDRESS=0xd9145CCE52D386f254917e481eB44e9943F39138`
    - `VITE_MANUFACTURER_REGISTRY_ADDRESS=0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8`
  - Optional: set `VITE_WALLETCONNECT_PROJECT_ID` if you use WalletConnect.

- Backend
  - Copy `backend/.env.example` to `backend/.env` and set the values.
  - Required:
    - `MEDCHAIN_CONTRACT=0xd9145CCE52D386f254917e481eB44e9943F39138`
  - Optional:
    - `MANUFACTURER_REGISTRY_CONTRACT=0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8`
    - `CHAIN_ID=11155111` (Sepolia)
    - Either `RPC_URL` OR `INFURA_API_KEY` for Sepolia. Example:
      - `RPC_URL=https://sepolia.infura.io/v3/<YOUR_INFURA_KEY>`
        or
      - `INFURA_API_KEY=<YOUR_INFURA_KEY>` (used by the default RPC URL template)

2) Install dependencies

```bash
# In one terminal (backend)
cd backend
npm install

# In another terminal (frontend)
cd client
npm install
```

3) Run the servers

```bash
# Backend (http://localhost:5000)
cd backend
npm run dev

# Frontend (http://localhost:5173)
cd client
npm run dev
```

Open the app at http://localhost:5173. The backend health endpoint is at http://localhost:5000/health.

---

## Environment Variables

Frontend (`client/.env.development` for local dev; Vite requires `VITE_` prefix):

- `VITE_CHAIN_ID` (default `11155111` for Sepolia)
- `VITE_BACKEND_URL` (default `http://localhost:5000`, used for proxy in dev)
- `VITE_SUBGRAPH_URL` (optional, The Graph endpoint)
- `VITE_MEDCHAIN_ADDRESS` (MedChain contract)
- `VITE_MANUFACTURER_REGISTRY_ADDRESS` (ManufacturerRegistry contract)
- `VITE_WALLETCONNECT_PROJECT_ID` (optional)

Backend (`backend/.env`):

- `MEDCHAIN_CONTRACT` (required)
- `MANUFACTURER_REGISTRY_CONTRACT` (optional)
- `CHAIN_ID` (default `11155111` for Sepolia)
- `RPC_URL` or `INFURA_API_KEY` (one of these is required for blockchain reads)
- `PORT` (default `5000`)

---

## Project Structure

```
MedChain/
├─ backend/               # Express API (read-only blockchain queries)
│  ├─ server.js
│  ├─ package.json
│  ├─ .env.example
│  └─ .env                # not committed
└─ client/                # React + Vite app
   ├─ src/
   │  ├─ api/
   │  ├─ components/
   │  ├─ hooks/
   │  ├─ pages/
   │  ├─ App.jsx
   │  └─ main.jsx
   ├─ vite.config.js
   ├─ package.json
   ├─ .env.example
   └─ .env.development    # not committed
```

---

## Notes & Tips

- The frontend proxy is configured in `client/vite.config.js` to forward `/api` and `/health` to the backend URL.
- If you change env vars, restart the dev servers.
- Contract ABIs for read calls are embedded in `backend/server.js`. Update as your contracts evolve.

---

## Troubleshooting

- Backend returns 503: "MedChain contract address not configured".
  - Ensure `MEDCHAIN_CONTRACT` is set in `backend/.env`.

- Blockchain calls failing or timing out.
  - Ensure `RPC_URL` or `INFURA_API_KEY` is set and valid.
  - Confirm your `CHAIN_ID` matches the network your contracts are deployed on.

- Frontend can’t reach backend.
  - Confirm backend is running on `http://localhost:5000`.
  - Check `VITE_BACKEND_URL` and Vite proxy settings in `client/vite.config.js`.

---

## License

MIT
