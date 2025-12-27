.PHONY: help install dev build lint format clean docker-dev docker-prod

# Default target
help:
	@echo "GMGN Clone - Available Commands"
	@echo ""
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Start development servers"
	@echo "  make build        - Build for production"
	@echo "  make lint         - Run ESLint on all projects"
	@echo "  make format       - Format code with Prettier"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-dev   - Start with Docker (development)"
	@echo "  make docker-prod  - Start with Docker (production)"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ All dependencies installed"

# Development
dev:
	@echo "🚀 Starting development servers..."
	@echo "Start frontend: cd frontend && npm run dev"
	@echo "Start backend: cd backend && npm run dev"

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && npm run dev

# Build
build:
	@echo "🔨 Building frontend..."
	cd frontend && npm run build
	@echo "🔨 Building backend..."
	cd backend && npm run build
	@echo "✅ Build complete"

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && npm run build

# Linting
lint:
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint
	@echo "🔍 Linting backend..."
	cd backend && npm run lint
	@echo "✅ Linting complete"

lint-fix:
	@echo "🔧 Fixing lint issues..."
	cd frontend && npm run lint:fix
	cd backend && npm run lint:fix
	@echo "✅ Lint fixes applied"

# Formatting
format:
	@echo "💅 Formatting code..."
	cd frontend && npm run format
	cd backend && npm run format
	@echo "✅ Formatting complete"

format-check:
	cd frontend && npm run format:check
	cd backend && npm run format:check

# Type checking
type-check:
	@echo "🔎 Type checking..."
	cd frontend && npm run type-check
	cd backend && npm run type-check
	@echo "✅ Type check complete"

# Clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf frontend/dist frontend/node_modules
	rm -rf backend/dist backend/node_modules
	@echo "✅ Clean complete"

# Docker
docker-dev:
	docker-compose --profile dev up --build

docker-prod:
	docker-compose up --build

docker-down:
	docker-compose down

docker-clean:
	docker-compose down -v --rmi all
