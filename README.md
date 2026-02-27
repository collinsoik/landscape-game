# Landscape Builders

A collaborative, real-time multiplayer game where students work in teams to design sustainable, biodiverse landscapes. Players place trees, flowers, water features, and wildlife habitat on a shared canvas to maximize ecosystem health — learning ecological principles through hands-on puzzle missions.

Built for classroom use: a teacher creates a room, shares a join code, and students play from their own devices (laptops, tablets, or phones).

---

## Table of Contents

- [Overview](#overview)
- [How the Game Works](#how-the-game-works)
- [Running the Activity in Your Classroom](#running-the-activity-in-your-classroom)
- [Campaigns and Missions](#campaigns-and-missions)
- [Scoring System](#scoring-system)
- [Setup and Installation](#setup-and-installation)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Overview

**What is it?** An ecology-themed strategy game where teams of students collaborate in real time to build the best landscape they can within a budget and time limit.

**What do students learn?**
- Plant-pollinator relationships and why biodiversity matters
- How invasive species disrupt ecosystems
- Resource management and trade-offs (limited budget, limited actions)
- Spatial reasoning — where you place elements matters (synergies and conflicts)
- Collaborative decision-making under time pressure

**How many students?** Up to 32 players per room, split across 2–8 teams (3–4 students per team works best).

**What devices?** Any device with a modern web browser — laptops, Chromebooks, tablets, or phones.

**How long?** Individual missions run 60–120 seconds. A full campaign chapter (4 missions) takes about 15–20 minutes including discussion time. A full class period can cover one campaign chapter comfortably.

---

## How the Game Works

### Core Gameplay Loop

1. **Teams form** — Students join a room and get auto-assigned to color-coded teams (Red Cardinals, Blue Jays, Green Frogs, etc.)
2. **Round starts** — Each team gets a coin budget, a set of available landscape elements, and a time limit
3. **Build together** — Team members place, move, and remove elements on their team's zone of the shared canvas
4. **Scores update live** — As elements are placed, scores recalculate in real time showing synergies, conflicts, and pattern bonuses
5. **Round ends** — Final scores are shown with star ratings and feedback
6. **Next mission or debrief** — Teacher decides when to advance

### Landscape Elements (40+)

Students choose from elements across several categories:

| Category | Examples | Cost Range |
|----------|----------|------------|
| Trees | Oak, Maple, Pine, Fruit Tree | 3–4 coins |
| Shrubs | Native Shrub, Berry Bush | 2 coins |
| Flowers | Wildflower Patch, Sunflower, Coneflower | 1–2 coins |
| Ground Cover | Native Grass, Clover | 1 coin |
| Water Features | Small Pond, Rain Garden | 5 coins |
| Structures | Birdhouse, Insect Hotel, Compost Bin | 2–3 coins |
| Wildlife Habitat | Log Pile, Rock Garden, Bee Hotel | 2–3 coins |

### What Makes It Strategic

- **Synergies** — Placing compatible elements near each other earns bonus points (e.g., Fruit Tree + Insect Hotel = pollination bonus)
- **Conflicts** — Incompatible elements lose points (e.g., Sunflower under an Oak's shade)
- **Ecosystem Patterns** — Arranging specific combinations triggers large bonuses (e.g., Pollinator Garden = wildflower + sunflower + insect hotel nearby)
- **Diminishing Returns** — Spamming the same element gives less and less value; diversity is rewarded
- **Budget Pressure** — Can't afford everything, so teams must prioritize

---

## Running the Activity in Your Classroom

### Quick Start (Using the Hosted Version)

If the game is already deployed (ask your school's tech contact), you don't need to install anything.

**Step 1 — Create a Room**

1. Go to the admin page: `https://<your-game-url>/admin`
2. Select a campaign or scenario
3. Click **Create Room** — you'll get a 6-character room code (e.g., `HKR4W7`)

**Step 2 — Students Join**

1. Students go to `https://<your-game-url>` on their devices
2. They enter the room code and their name
3. They appear in the lobby — you can see all connected students on the admin view

**Step 3 — Start the Game**

1. Once all students have joined, click **Start Round** on the admin dashboard
2. Students are auto-assigned to teams and see their canvas, budget, and available elements
3. The timer begins counting down

**Step 4 — During the Round**

- Students collaborate within their teams to place elements
- Scores update in real time on everyone's screen
- You can **pause** the round from the admin panel if you want to discuss strategy
- Synergy and conflict indicators appear as students build

**Step 5 — After the Round**

- Scores and star ratings appear automatically
- Use the results as a discussion prompt:
  - "Why did Team Blue score higher on biodiversity?"
  - "What synergies did Team Red discover?"
  - "How could you fix the conflicts in your design?"
- Advance to the next mission when ready

### Suggested Classroom Workflows

**Quick Activity (15 min)**
- Pick one standalone mission from Greenfield Park Chapter 1
- Good for: introducing the game, a warm-up, or a lesson hook

**Full Lesson (45 min)**
- Run one full campaign chapter (4 missions)
- Discuss ecological concepts between missions using the eco-lesson prompts built into each mission
- Good for: ecology unit on pollinators, invasive species, or habitat design

**Multi-Day Unit**
- Run the full Greenfield Park campaign (12 missions across 3 chapters) over 3–4 class periods
- Missions get progressively harder; Chapter 3 unlocks only after earning enough stars
- Good for: extended ecology or environmental science units

### Tips for Teachers

- **Project the admin view** on your classroom screen so everyone can see the overall game state
- **3–4 students per team** is the sweet spot — enough for collaboration, small enough that everyone participates
- **Pause between rounds** to ask teams to explain their strategy before seeing scores
- **Free Play mode** (in legacy scenarios) is great for open-ended exploration with no scoring pressure
- **Star ratings** (1–3 stars per mission) give students goals to chase — Chapter 3 requires 14 stars to unlock, motivating replays

---

## Campaigns and Missions

### Greenfield Park (Beginner — 12 Missions)

*"Transform an empty lot into a thriving ecosystem!"*

| Chapter | Missions | Unlock Requirement | Focus |
|---------|----------|-------------------|-------|
| **1: First Seeds** | Flower Bed, Pollinator Paradise, Shade Shuffle, 60-Second Sprint | Start here | Basic placement, first synergies, fixing conflicts |
| **2: Growing Pains** | Weed Invasion, Bird Corner, Wetland Starter, Eco Superstar | 6 stars | Invasive species, water ecosystems, multi-category scoring |
| **3: Master Ecologist** | 4 advanced missions | 14 stars | Mid-mission events (drought, invasive waves), complex patterns |

**Example Mission — "Pollinator Paradise" (Chapter 1):**
- Time: 90 seconds
- Budget: 8 coins, 6 actions
- Goal: Achieve the "Pollinator Garden" ecosystem pattern
- Eco Lesson: *"About 75% of all flowering plants are pollinated by insects. A pollinator garden combines nectar-rich flowers with nesting habitat."*
- 3 Stars: Complete the pattern + get 3 synergies + no conflict penalties

### Invasive Takeover (Intermediate — 6 Missions)

*"An invasive species outbreak threatens the park. Clear, rebuild, defend!"*

| Chapter | Missions | Focus |
|---------|----------|-------|
| **1: Clear the Invasion** | Overrun, The Comeback | Remove invasives, restore native plants |
| **2: Rebuild & Defend** | 2 missions | Rebuild while invasives return mid-round |
| **3: Thriving Ecosystem** | 2 missions | Sustained invasive waves, complex defenses |

### Legacy Scenarios (Standalone)

These are simpler, non-campaign modes:
- **Neighborhood Park** — Beginner, design a community park
- **Budget Crunch** — Advanced, very tight budget forces hard choices
- **Restore the Wetland** — Intermediate, rebuild a degraded wetland
- **Free Play** — Unlimited budget, all elements, no scoring pressure

---

## Scoring System

Scores are calculated across four categories:

| Category | What It Measures |
|----------|-----------------|
| **Biodiversity** | Wildlife diversity, native plants, pollinator support |
| **Sustainability** | Water management, carbon sequestration, soil health |
| **Aesthetics** | Visual appeal, color variety, composition |
| **Ecosystem Health** | Food web complexity, habitat connectivity, resilience |

### How Points Are Earned

1. **Base Scores** — Each element contributes points to each category (e.g., Oak Tree = 6 biodiversity, 5 sustainability, 5 aesthetics, 7 ecosystem health)
2. **Synergy Bonuses (+5 to +11 pts)** — Placing compatible elements within range of each other (63 possible synergies)
3. **Ecosystem Pattern Bonuses (+25 to +40 pts)** — Arranging specific sets of elements together triggers named patterns like "Bird Sanctuary" or "Woodland Edge"
4. **Diversity Bonus (up to +55 pts)** — Using elements from many different categories
5. **Cross-Zone Bonus (+3 pts each, max +30)** — Placing elements in other teams' zones encourages collaboration
6. **Conflict Penalties (-2 to -5 pts)** — Placing incompatible elements near each other (11 possible conflicts)

### Star Ratings (Campaign Missions)

- **1 Star** — Complete the mission objectives
- **2 Stars** — Objectives + reach a score threshold
- **3 Stars** — Objectives + higher score + bonus conditions (e.g., no conflicts, multiple synergies)

---

## Setup and Installation

### Prerequisites

- **Node.js 18+** and **npm**
- A terminal (macOS Terminal, Windows PowerShell, Linux shell)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd landscape-game
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

```bash
# Frontend — create .env.local in the project root
cp .env.example .env.local
```

Contents of `.env.local`:
```
NEXT_PUBLIC_WS_URL=http://localhost:3004
NEXT_PUBLIC_API_URL=http://localhost:3004
```

```bash
# Backend — create .env in the server/ directory
cp server/.env.example server/.env
```

Contents of `server/.env`:
```
PORT=3004
NODE_ENV=development
DB_PATH=./data/landscape.db
UPLOAD_DIR=./data/uploads
CORS_ORIGIN=http://localhost:3000
ADMIN_SECRET=changeme
```

Change `ADMIN_SECRET` to something unique if deploying publicly.

### 4. Start Both Servers

You need **two terminal windows** (or tabs):

**Terminal 1 — Backend (game server):**
```bash
cd server
npm run dev
```
The server starts at `http://localhost:3004`.

**Terminal 2 — Frontend (website):**
```bash
npm run dev
```
The website starts at `http://localhost:3000`.

### 5. Open the Game

- **Admin panel:** http://localhost:3000/admin — create rooms here
- **Student entry:** http://localhost:3000 — students join with the room code

### Network Access for Classroom Use

For students to connect from their own devices, they need to reach the server. Options:

| Approach | Complexity | Notes |
|----------|------------|-------|
| **All on same WiFi** | Easy | Students use your machine's local IP (e.g., `http://192.168.1.42:3000`) |
| **Deploy to Vercel + VM** | Medium | Frontend on Vercel, backend on a cloud VM or school server |
| **Cloudflare Tunnel** | Medium | Exposes your local server to the internet securely (no port forwarding) |

For local network use, find your IP with `hostname -I` (Linux) or `ipconfig` (Windows) and have students navigate to `http://<your-ip>:3000`.

---

## Project Structure

```
landscape-game/
├── app/                          # Next.js pages (frontend)
│   ├── page.tsx                  # Landing page — join a room
│   ├── admin/                    # Room creation & admin dashboard
│   └── room/[roomCode]/          # Lobby and game views
│       └── game/                 # Main game canvas
├── components/                   # React components
│   ├── game/                     # Canvas, HUD, scoring display
│   ├── admin/                    # Admin controls
│   ├── campaign/                 # Campaign/mission UI
│   └── shared/                   # Reusable UI (buttons, cards, etc.)
├── config/                       # Game configuration
│   ├── elements.ts               # All landscape element definitions
│   ├── scoring-rules.ts          # Synergies, conflicts, patterns
│   ├── scenarios.ts              # Scenarios and campaign definitions
│   └── game-defaults.ts          # Canvas size, team names/colors
├── lib/                          # Utilities
│   ├── scoring/                  # Client-side score preview
│   └── ws/                       # WebSocket client helpers
├── store/                        # Zustand state management
├── server/                       # Express + Socket.io backend
│   ├── src/
│   │   ├── index.ts              # Main server entry point
│   │   ├── config/campaigns.ts   # Campaign/mission configurations
│   │   ├── game/                 # Room, round, budget, team logic
│   │   ├── scoring/              # Authoritative score engine
│   │   └── db/                   # SQLite database
│   └── package.json
├── public/                       # Static assets
└── package.json
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript |
| Canvas | Konva.js (2D rendering) |
| State | Zustand |
| Real-time | Socket.io (WebSockets) |
| Backend | Express.js |
| Database | SQLite |
| Styling | Tailwind CSS |

---

## Troubleshooting

**Students can't connect**
- Make sure both the frontend (`npm run dev` in root) and backend (`npm run dev` in `server/`) are running
- Check that students are using the correct URL (your machine's IP if on local network, not `localhost`)
- Verify the `.env.local` file points to the correct backend URL

**"Start Round" button doesn't work**
- Make sure the admin has joined the room (the admin must be connected via WebSocket, not just viewing the page)
- Try refreshing the admin page and re-creating the room
- Check the server terminal for error messages

**Scores seem wrong or don't update**
- Scores update in real time on every placement — if they seem stuck, check the server terminal for errors
- The server is the authoritative scorer; the client preview is an approximation

**Game is laggy**
- Reduce the number of teams if you have fewer students
- Close unnecessary browser tabs on student devices
- On slower networks, ensure the backend is on the same local network as the students

**Database errors**
- The SQLite database is created automatically in `server/data/landscape.db`
- If it gets corrupted, stop the server, delete the file, and restart — it will be recreated from the schema
