# 🎯 DropHunt - Daily Mystery Drops Game

**Tagline:** Shop's product catalog meets Wordle-style daily obsession.

## 🚀 Overview

DropHunt is an innovative Shop Mini that gamifies product discovery through daily mystery challenges. Each day, users get a new "mystery drop" to solve through clues, creating a habit-forming shopping experience that drives engagement and discovery.

## ✨ Key Features

### 🎮 Core Gameplay
- **Daily Mystery Product**: One new product puzzle every 24 hours
- **Progressive Clue System**: Reveal hints one by one to identify the mystery product
- **Smart Scoring**: Points based on speed and number of clues used
- **Streak Tracking**: Build daily streaks for consistent play

### 🎨 Beautiful UI/UX
- Smooth animations and transitions
- Confetti celebrations on successful solves
- Glass morphism effects
- Responsive, mobile-first design
- Gradient backgrounds and modern aesthetics

### 📊 Social & Competitive
- Share results with emoji grids (Wordle-style)
- Challenge friends to beat your score
- Leaderboard system (ready for implementation)
- Social media integration

### 🛍️ Shop Integration
- Leverages Shop's extensive product catalog
- Direct product links for immediate purchase
- Personalized clues based on shopping history
- Featured brands and merchants

## 🏃 Running the App

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npx shop-minis dev
```

3. **View in browser:**
The app will open automatically at `http://localhost:3000`

### Testing in Shop App
To test in the actual Shop app environment:
1. Use the Shop Minis CLI development tools
2. Follow the QR code or link provided by the dev server
3. Test on your mobile device with Shop app installed

## 🎯 How to Play

1. **Start Daily Challenge**: Open DropHunt to see today's mystery product
2. **Reveal Clues**: Click "Reveal Next Clue" to uncover hints about the product
3. **Make Your Guess**: Browse suggested products or search the catalog
4. **Score Points**: Solve faster with fewer clues for higher scores
5. **Share & Compete**: Share your results and challenge friends

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks with persistent storage
- **Build Tool**: Vite for fast development
- **SDK**: @shopify/shop-minis-react

### Key Components
- `Game.tsx`: Main game controller
- `ClueCard.tsx`: Animated clue reveal system
- `ProductReveal.tsx`: Victory screen with animations
- `ShareModal.tsx`: Social sharing functionality
- `useGameState.ts`: Game logic and persistence

## 🎨 Design Highlights

- **Color Palette**: Purple to pink gradients for engaging visuals
- **Animations**: Custom keyframes for smooth transitions
- **Responsive**: Optimized for all mobile screen sizes
- **Accessibility**: High contrast, clear typography

## 🚀 Why DropHunt Wins

### Leverages Shop's Strengths
- Uses rich product metadata for intelligent clue generation
- Showcases merchant diversity
- Drives product discovery

### Habit-Forming Mechanics
- Daily refresh creates anticipation
- Streak system encourages retention
- Social sharing drives viral growth

### Personalization at Scale
- Adapts to user preferences
- Learns from purchase history
- Tailors difficulty to engagement level

## 📈 Future Enhancements

- **AI-Powered Clues**: Use GPT to generate creative, contextual hints
- **Multiplayer Mode**: Real-time collaborative solving
- **Themed Weeks**: Special events (Black Friday, Earth Day, etc.)
- **Merchant Spotlights**: Feature specific brands/stores
- **Achievement System**: Badges and rewards for milestones

## 🤝 Contributing

This is a hackathon project for Shopify's Shop Mini challenge. Feel free to fork and enhance!

## 📝 License

Created for Shopify Hackathon 2024

---

**Built with ❤️ for the Shop App ecosystem**
