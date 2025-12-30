# GMGN.AI Clone

A production-ready cryptocurrency trading platform clone replicating the core trading experience of GMGN.AI.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 20+ (for local development)

### Running with Docker (Recommended)

```bash
# Start the application
docker-compose up -d

# Check status
docker ps

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

### Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

| Document                                           | Description                                                      |
|----------------------------------------------------|------------------------------------------------------------------|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)**               | 🚀 Complete deployment & development guide with troubleshooting  |
| **[terraform/README.md](./terraform/README.md)**   | 🛠️ Infrastructure management with Terraform                     |
| **[docs/UX_FLOW.md](./docs/UX_FLOW.md)**           | 📱 User experience and flow documentation                        |

**Quick Deploy**: See `DEPLOYMENT.md` for local development and automated AWS deployment!

**Deployment Helper**: Use `./deployment-helper.sh` for diagnostics and fixes

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript (Strict mode)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Charts**: Lightweight Charts (TradingView)
- **Styling**: SCSS Modules + CSS Variables
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet, CORS, UUID-based IDs

### DevOps
- **Containerization**: Docker + Docker Compose
- **Health Checks**: Automated container health monitoring
- **Multi-stage Builds**: Optimized production images

## 📁 Project Structure

```
gmgn-clone/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # SCSS modules
│   │   └── utils/           # Utility functions
│   ├── Dockerfile           # Production container
│   └── nginx.conf           # Nginx configuration
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── data/            # Mock data & stores
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── Dockerfile           # Production container
└── docker-compose.yml        # Docker orchestration
```

## ✨ Features

- 🔐 **Authentication**: Secure login/register system
- 📊 **Real-time Trading**: Live price charts with TradingView
- 💰 **Wallet Management**: Track balances and transactions
- 📈 **Market Data**: Browse tokens with live market stats
- 🔄 **Copy Trading**: Follow and copy successful traders
- 📱 **Responsive Design**: Mobile-first UI with bottom navigation

## 🔧 Common Commands

### Development
```bash
# Install dependencies
npm install                       # In backend/ or frontend/
make install                      # Install both

# Start dev servers
npm run dev                       # In backend/ or frontend/
make dev                          # Instructions for both

# Build for production
npm run build                     # In backend/ or frontend/
make build                        # Build both

# Linting and type checking
npm run lint                      # Run linter
npm run type-check                # TypeScript check
make lint                         # Lint both projects
```

### Docker
```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose restart            # Restart services
docker-compose down -v            # Remove containers and volumes
docker-compose up -d --build      # Rebuild and start

make docker-up                    # Start with Docker
make docker-down                  # Stop containers
make docker-clean                 # Remove everything
```

### Deployment (AWS)
```bash
./deployment-helper.sh diagnose   # Full diagnostics
./deployment-helper.sh verify     # Verify deployment
./deployment-helper.sh logs       # View remote logs
./deployment-helper.sh fix-cors   # Fix CORS issues
./deployment-helper.sh fix-ssh    # Fix SSH connectivity
./deployment-helper.sh restart    # Restart containers
./deployment-helper.sh help       # See all commands
```

## 🚨 Troubleshooting

For detailed troubleshooting, see the **Troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting)**

Quick diagnostic:
```bash
./deployment-helper.sh diagnose
```

### Common Issues

**Port Already in Use:**
```bash
docker-compose down               # Stop existing containers
# Or kill process: lsof -ti:4000 | xargs kill -9
```

**Container Health Issues:**
```bash
docker ps                         # Check status
docker-compose logs backend       # View logs
./deployment-helper.sh logs       # Interactive log viewer
```

**Deployment Issues:**
```bash
./deployment-helper.sh verify     # Verify deployment
./deployment-helper.sh fix-cors   # Fix CORS
./deployment-helper.sh fix-ssh    # Fix SSH connectivity
```

**Clean Rebuild:**
```bash
docker-compose down -v --rmi all  # Remove everything
docker-compose up -d --build      # Fresh start
```

## 📊 API Endpoints

| Endpoint                  | Method | Description       |
|---------------------------|--------|-------------------|
| `/api/health`             | GET    | Health check      |
| `/api/auth/register`      | POST   | Register new user |
| `/api/auth/login`         | POST   | User login        |
| `/api/market/tokens`      | GET    | List all tokens   |
| `/api/market/trending`    | GET    | Trending tokens   |
| `/api/trading/order`      | POST   | Place order       |
| `/api/wallet/summary`     | GET    | Wallet summary    |
| `/api/copy-trade/traders` | GET    | List traders      |

## 🔐 Security Features

- ✅ UUID-based ID generation (cryptographically secure)
- ✅ URL parameter encoding (prevents injection)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Type-safe APIs (TypeScript)


## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for the crypto trading community**

## 🔧 AI Tools Used

- Claude (Anthropic) - Code generation based on architecture design
- GitHub Copilot - Code bug fixes and suggestions
