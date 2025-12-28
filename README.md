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

| Document                                             | Description                                           |
|------------------------------------------------------|-------------------------------------------------------|
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**     | Complete deployment guide (GitHub Pages, Docker, etc) |
| **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** | Complete code architecture, patterns, best practices  |
| **[ISSUE_RESOLUTIONS.md](./ISSUE_RESOLUTIONS.md)**   | Recent fixes and improvements made to the codebase    |

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

```bash
# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose restart            # Restart services

# Development
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run lint                      # Run linter
npm run type-check                # TypeScript check

# Clean restart
docker-compose down -v            # Remove containers and volumes
docker-compose up -d --build      # Rebuild and start
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Stop existing containers
docker-compose down

# Or kill process on port
lsof -ti:4000 | xargs kill -9     # Backend
lsof -ti:3000 | xargs kill -9     # Frontend
```

### Container Health Issues
```bash
# Check container status
docker ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Inspect health check
docker inspect gmgn-backend --format='{{.State.Health.Status}}'
```

### Clean Rebuild
```bash
# Remove all containers, networks, and volumes
docker-compose down -v --rmi all

# Start fresh
docker-compose up -d --build
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

See [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) for complete API documentation.

## 🔐 Security Features

- ✅ UUID-based ID generation (cryptographically secure)
- ✅ URL parameter encoding (prevents injection)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Type-safe APIs (TypeScript)

## 🎯 Recent Improvements

See [ISSUE_RESOLUTIONS.md](./ISSUE_RESOLUTIONS.md) for detailed changelog including:
- UUID-based transaction hashes for security
- Removed deprecated type fields for clarity
- Fixed hardcoded token balances in sell orders
- Performance optimizations with useMemo
- URL encoding for logo URLs
- Healthcheck configuration corrections

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

## 📄 Additional Documentation

- [UX Flow Documentation](./docs/UX_FLOW.md)

## 🚀 Deployment

This application is designed to be deployed using **Docker** for both frontend and backend.

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions including:

### Docker Deployment (Recommended)
- **Local Development**: `docker-compose up -d` - runs both frontend and backend
- **Production VPS**: Deploy on DigitalOcean, AWS EC2, Linode ($5-6/month)
- **Docker Hub**: Push images and deploy anywhere
- **Cloud Platforms**: AWS ECS, Google Cloud Run

### Alternative Platforms
- **GitHub Pages** (frontend only) + Docker backend on VPS
- **Render.com** (backend without Docker)
- **Railway** (supports Docker)
- **Vercel** (frontend only)

**Quick Start with Docker:**
```bash
# Clone and start
git clone https://github.com/peterzzshi/gmgn-clone.git
cd gmgn-clone
docker-compose up -d --build

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000/api
```

**Production Deployment:**
```bash
# On your VPS (DigitalOcean, AWS, etc.)
git clone https://github.com/peterzzshi/gmgn-clone.git
cd gmgn-clone

# Configure environment
nano .env  # Set production values

# Deploy
docker-compose up -d --build
```

See the full guide for VPS setup, SSL configuration, and troubleshooting.

## 📜 License

MIT License
