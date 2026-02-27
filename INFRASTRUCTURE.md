# Landscape Game — Server Infrastructure

## Overview

The Landscape Game is a multiplayer browser game with a **Vercel frontend** and a **Node.js backend** running on a shared VM (`dev` server). The backend is managed by **PM2** and exposed to the internet through a **shared Cloudflare Tunnel**.

## Architecture

```
┌──────────────────────────┐      ┌─────────────────────────────────────────┐
│  Vercel (Frontend)       │      │  VM: dev server (Backend)               │
│                          │      │                                         │
│  landscape-game.vercel.app ──────▶ cloudflared (systemd)                 │
│  (Next.js SSR + API      │      │   └─▶ game-api.collinsoik.dev          │
│   routes)                │      │        └─▶ localhost:3004              │
│                          │      │             └─▶ PM2: landscape-api     │
└──────────────────────────┘      │                  (node dist/index.js)  │
                                  │                                         │
                                  │  Also on this VM:                       │
                                  │  ├─ DesignDash  :3002  (Docker)         │
                                  │  └─ EngiQuest   :3005  (PM2)            │
                                  └─────────────────────────────────────────┘
```

## Backend Process Management

The backend runs under **PM2** in **fork mode** (not cluster — cluster mode breaks ESM top-level await).

**Config:** `/home/collin/landscape-game/server/ecosystem.config.cjs`

```js
module.exports = {
  apps: [{
    name: "landscape-api",
    script: "dist/index.js",
    cwd: "/home/collin/landscape-game/server",
    node_args: "--env-file=.env",
    exec_mode: "fork",
    env: { NODE_ENV: "production" },
    autorestart: true,
    max_memory_restart: "500M",
  }],
};
```

**Common commands:**

| Action | Command |
|---|---|
| View status | `pm2 list` |
| View logs | `pm2 logs landscape-api` |
| Restart | `pm2 restart landscape-api` |
| Stop | `pm2 stop landscape-api` |
| Rebuild + restart | `cd /home/collin/landscape-game/server && npm run build && pm2 restart landscape-api` |
| Save state (after changes) | `pm2 save` |

## Environment

**File:** `/home/collin/landscape-game/server/.env`

Key variables:
- `NODE_ENV=production`
- `PORT=3004`
- `CORS_ORIGIN=https://landscape-game-sage.vercel.app` (must match the Vercel deployment URL)
- `DB_PATH` — SQLite database path
- `UPLOAD_DIR` — file upload directory
- `ADMIN_SECRET` — admin authentication

## Cloudflare Tunnel (Shared)

A single Cloudflare tunnel serves all three game APIs on this VM. It runs as a **system-level systemd service**.

**Service:** `/etc/systemd/system/cloudflared.service`
**Config:** `/home/collin/.cloudflared/config.yml`

Routes:
- `game-api.collinsoik.dev` → `localhost:3004` (this project)
- `dash-api.collinsoik.dev` → `localhost:3002` (DesignDash)
- `engiquest-api.collinsoik.dev` → `localhost:3005` (EngiQuest)

**Commands:**
- `sudo systemctl status cloudflared` — check tunnel status
- `sudo systemctl restart cloudflared` — restart the tunnel
- `journalctl -u cloudflared -f` — tail tunnel logs

> **Warning:** Restarting or stopping cloudflared affects ALL three games, not just this one.

## Boot Persistence

Everything auto-starts on VM reboot:

| Component | Mechanism |
|---|---|
| cloudflared | systemd service (`enabled`) |
| landscape-api | PM2 via `pm2-collin` systemd service |
| PM2 process list | Saved with `pm2 save` — restored on boot |

After any PM2 config changes, always run `pm2 save` to persist the process list.

## Game Economy (Server-Side)

The server manages three economy systems per team per round, all stored in-memory Maps keyed by `${sessionId}:${teamId}:${round}`:

| System | Module | Purpose |
|---|---|---|
| **Budget** | `server/src/game/BudgetManager.ts` | Coin spending/refunding with partial refund rates |
| **Actions** | `server/src/game/ActionManager.ts` | Finite place/move/remove actions per round |
| **Scenarios** | `server/src/config/scenarios.ts` | Per-round budget, actionLimit, and refundRate config |

**Key behaviors:**
- `refundRate` (0.0–1.0) controls how much coin you get back when removing your own element: `Math.round(cost * refundRate)`
- `actionLimit` (0 = unlimited) caps total place + move + remove actions per team per round
- Action checks happen **before** budget checks to avoid rollback complexity
- Both systems broadcast updates to the team socket room after each successful action
- Free Play uses `budget=0, actionLimit=0, refundRate=1.0` (unlimited everything)

**Socket events:**
- `budget:update` → `{ teamId, remaining, total }`
- `actions:update` → `{ teamId, remaining, limit }`

## Health Check

- **Local:** `curl http://localhost:3004/api/health`
- **External:** `curl https://game-api.collinsoik.dev/api/health`
- **Full status:** `~/server-status.sh` (checks all services on the VM)

## Frontend API Proxy

The Next.js frontend on Vercel includes API route handlers (e.g., `app/api/rooms/route.ts`) that proxy requests to the backend. If the backend is unreachable, these can hang — a fetch timeout (`AbortSignal.timeout(10000)`) is recommended on all outbound `fetch()` calls.

## Docker (Legacy)

There is a `Dockerfile` and `docker-compose.yml` in `server/` from an earlier setup. The project currently runs via **PM2, not Docker**. The Docker files remain for reference but are not actively used. Note: the Dockerfile has a port mismatch (defaults to 3001 instead of 3004) — fix if ever switching back to Docker.

## Troubleshooting

**Backend not responding:**
1. `pm2 list` — is `landscape-api` online?
2. `pm2 logs landscape-api --lines 50` — check for errors
3. `sudo systemctl status cloudflared` — is the tunnel running?
4. `curl http://localhost:3004/api/health` — can the server respond locally?

**Economy state lost after restart:**
- Budget, action limits, and refund rates are stored in-memory (not SQLite)
- Restarting the server clears all in-progress round economy state
- Players must wait for the next round start to get fresh economy state
- This is by design — rounds are short-lived and state is re-initialized each round

**High restart count:**
- Check `pm2 logs landscape-api` for crash reasons
- Ensure `.env` file exists and has correct values
- Verify `dist/index.js` exists (run `npm run build` if missing)

**Room creation hanging on frontend:**
- Usually means the tunnel is down or backend is crashed
- Check `~/server-status.sh` for a full picture
