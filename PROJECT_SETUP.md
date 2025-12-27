# GMGN.AI Clone - Project Setup Guide

## Project Structure

```
gmgn-clone/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── eslint.config.js
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── types/
│   │   ├── data/            # Mock data
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── eslint.config.js
├── docs/                     # UX documentation
│   └── UX_FLOW.md
├── docker-compose.yml
├── .gitignore
├── .editorconfig
└── README.md
```

## Step 1: Initialize Root Project

```bash
cd gmgn-clone

# Initialize root package.json for workspace management
npm init -y

# Create directory structure
mkdir -p frontend backend docs
```

## Step 2: Initialize Frontend

```bash
cd frontend

# Create Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install react-router-dom@6 zustand @tanstack/react-query axios
npm install lightweight-charts dayjs clsx

# Install UI dependencies
npm install lucide-react framer-motion

# Install dev dependencies
npm install -D @types/node sass

# Install ESLint 9 + Airbnb + TypeScript support
npm install -D eslint@^9.0.0 globals typescript-eslint
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D eslint-plugin-jsx-a11y eslint-plugin-import
npm install -D @stylistic/eslint-plugin

# Install Prettier
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

## Step 3: Initialize Backend

```bash
cd ../backend

# Initialize package.json
npm init -y

# Install core dependencies
npm install express cors helmet morgan
npm install dotenv

# Install TypeScript and types
npm install -D typescript @types/node @types/express @types/cors @types/morgan
npm install -D ts-node tsx nodemon

# Install ESLint 9 + Airbnb style
npm install -D eslint@^9.0.0 globals typescript-eslint
npm install -D eslint-plugin-import @stylistic/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

## Step 4: Create Configuration Files

See the configuration files below that need to be created in each directory.
