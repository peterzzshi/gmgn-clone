# GMGN.AI Clone

A web-based cryptocurrency trading platform clone replicating the core trading experience of GMGN.AI.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript (Strict mode)
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router v6
- **Charts**: Lightweight Charts (TradingView)
- **Styling**: SCSS + CSS Variables
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet, CORS

### Code Quality
- **Linting**: ESLint 9 with Airbnb-style rules
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Vercel / GitHub Pages

## 📁 Project Structure

```
gmgn-clone/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── ...
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── types/           # TypeScript types
│   │   └── data/            # Mock data
│   └── ...
├── docs/                     # Documentation
│   └── UX_FLOW.md           # UX flow documentation
└── docker-compose.yml
```

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm or pnpm
- Docker (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gmgn-clone.git
cd gmgn-clone

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running Development Servers

**Frontend (Terminal 1):**
```bash
cd frontend
npm run dev
# Available at http://localhost:3000
```

**Backend (Terminal 2):**
```bash
cd backend
npm run dev
# Available at http://localhost:4000
```

### Running with Docker

```bash
# Development mode
docker-compose --profile dev up

# Production mode
docker-compose up --build
```

## 📝 Available Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |

## 🎯 Core Features

1. **User Authentication** (Mock)
   - Login / Register
   - Session management

2. **Wallet Module**
   - Asset overview
   - Transaction history

3. **Trading Features**
   - Buy/Sell interface
   - K-line charts (TradingView Lightweight Charts)
   - Copy Trading

4. **Market Data**
   - Token listings
   - Real-time price updates

## 🔧 AI Tools Used

- Claude (Anthropic) - Code generation, architecture design
- [Add any other AI tools used]

## 📄 Documentation

- [UX Flow Documentation](./docs/UX_FLOW.md)

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### GitHub Pages
```bash
cd frontend
npm run build
# Configure GitHub Pages to serve from dist/ folder
```

## 📜 License

MIT License
