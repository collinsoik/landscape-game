# Bug: "Start Round" Does Not Work on Admin Dashboard

## Status
**Unresolved** — root causes identified from server logs, fix not yet implemented.

---

## Deployment Architecture

| Component | URL | Tech |
|-----------|-----|------|
| Frontend | `https://landscape-game-sage.vercel.app` | Next.js 16 on Vercel |
| Server | `https://game-api.collinsoik.dev` | Express + Socket.io on VM (port 3001) |
| Tunnel | Cloudflare named tunnel `landscape-game` | `cloudflared` → `http://localhost:3001` |
| Database | `./data/game.db` | SQLite via better-sqlite3 |

**Env vars:**
- Vercel: `NEXT_PUBLIC_WS_URL=https://game-api.collinsoik.dev` (set in project settings, baked at build time)
- Server `.env`: `PORT=3001`, `NODE_ENV=production`, `ADMIN_SECRET=d3a421e7dbec705d760ea06639fa488f`

---

## Symptom

1. Admin creates a room at `/admin` — **works**
2. Players join the room at `/` — **works**
3. Admin clicks "Start Round" on `/admin/[roomCode]` — **silently fails**, status stays "waiting"

---

## Root Causes (from server logs)

Server logs (`server/server.log`) show **two distinct failure modes** occurring in different attempts:

### Failure Mode 1: `adminToken` is empty string
```
[Admin] start-round auth failed: expected=841b150f-af15-47ce-87ea-4501636d4749, got=
```
**What's happening:** The admin dashboard sends `emit('admin:start-round', { adminToken })` where `adminToken` is read from `sessionStorage` on page load. The token is empty — it was never stored or was lost.

**Why:** The token storage flow has a subtle bug in `app/admin/page.tsx`:

```js
// Line 57-62: After room creation, result is reshaped
const data = await res.json();
setResult({
  roomCode: data.session?.roomCode ?? data.roomCode,
  adminToken: data.adminToken,
  judgeToken: data.judgeToken,
});

// Line 63: But sessionStorage uses data.roomCode (from the RAW response)
sessionStorage.setItem(`admin_${data.roomCode}`, data.adminToken);
```

The server returns `{ session: { roomCode: "ABC123", ... }, adminToken: "xxx" }`.
So `data.roomCode` is `undefined` (it's at `data.session.roomCode`), and the token gets stored under key `admin_undefined`.

Then the admin dashboard (`app/admin/[roomCode]/page.tsx` line 28) reads:
```js
const token = sessionStorage.getItem(`admin_${roomCode}`) ?? '';
// Reads admin_ABC123, but it was stored as admin_undefined → returns ''
```

**Fix:** Change line 63 in `app/admin/page.tsx` to:
```js
const roomCode = data.session?.roomCode ?? data.roomCode;
sessionStorage.setItem(`admin_${roomCode}`, data.adminToken);
sessionStorage.setItem(`judge_${roomCode}`, data.judgeToken);
```

### Failure Mode 2: Socket not in `socketPlayerMap`
```
[Admin] start-round rejected: socket 91UeUOGxwlD-HkbyAAA6 not in socketPlayerMap
```
**What's happening:** The admin socket emits `admin:start-round` but the server doesn't recognize it because the admin never successfully joined the room via `room:join`.

**Why:** The admin dashboard's `room:join` call is failing silently:

```js
// app/admin/[roomCode]/page.tsx line 36
emit('room:join', { roomCode, playerName: '__admin__' }, () => {});
//                                                        ^^^^^^^^
//                                                        callback is a no-op
```

The `room:join` handler in `server/src/index.ts` line 117-140 calls `joinRoom()` which can fail:
- `joinRoom()` in `server/src/game/RoomManager.ts` line 74: rejects if `session.status !== 'waiting'`
- If the session was already started (or the room doesn't exist after a server restart), the join fails
- The callback returns `{ success: false, error: '...' }` but the admin page ignores it
- Without a successful join, the socket is never added to `socketPlayerMap`
- All subsequent admin events silently fail at line 215-216

**Also:** The server logs show rapid connect/disconnect cycling, suggesting WebSocket connection instability through the Cloudflare tunnel (possibly related to WebSocket transport negotiation or Cloudflare timeouts).

---

## Key Files

| File | Role |
|------|------|
| `app/admin/page.tsx` | Room creation page — stores tokens in sessionStorage |
| `app/admin/[roomCode]/page.tsx` | Admin dashboard — reads tokens, emits admin events |
| `hooks/useWebSocket.ts` | WebSocket connection hook |
| `lib/ws/client.ts` | Socket.io client singleton |
| `store/wsMiddleware.ts` | Binds socket events to Zustand store |
| `server/src/index.ts` | Socket.io event handlers (lines 112-290) |
| `server/src/game/RoomManager.ts` | Room/session CRUD, `joinRoom()` logic |
| `server/src/game/RoundManager.ts` | Round start/end/timer logic |
| `server/src/game/TeamAssigner.ts` | Team assignment on round start |

---

## Fixes Needed

### Fix 1: sessionStorage key mismatch (Critical)
**File:** `app/admin/page.tsx` lines 63-64

The `sessionStorage.setItem` calls use `data.roomCode` but after the response reshaping, the room code is at `data.session.roomCode`. Store the room code in a variable before the `setResult` call and use it consistently.

### Fix 2: Admin join failure handling (Critical)
**File:** `app/admin/[roomCode]/page.tsx` line 36

The `room:join` callback must check `res.success` and handle failure — at minimum, surface an error. The admin must be in `socketPlayerMap` for any admin event to work.

Additionally, `joinRoom()` in `RoomManager.ts` rejects joins when `session.status !== 'waiting'`. The admin should be able to join regardless of status (they're an observer, not a player). Consider either:
- Adding a separate `admin:join` socket event that bypasses player validation
- Or modifying `joinRoom` to allow `__admin__` joins in any status

### Fix 3: WebSocket connection stability (Investigate)
The server logs show rapid connect/disconnect cycles. This could be:
- Cloudflare tunnel WebSocket handling — check if `websocket` transport needs to be configured in Cloudflare settings
- Socket.io polling fallback causing reconnect loops — the client config in `lib/ws/client.ts` uses `transports: ['websocket', 'polling']`
- React strict mode double-mounting in development (less likely in production)

---

## How to Reproduce

1. Start the server: `cd server && npm run build && cp src/db/schema.sql dist/db/schema.sql && node dist/index.js`
2. Open `https://landscape-game-sage.vercel.app/admin`
3. Create a room (enter a name, click "Create Room")
4. Note the room code, click "Go to Dashboard"
5. In another tab, go to `https://landscape-game-sage.vercel.app/`, enter room code + name, join
6. Back on admin dashboard, click "Start Round"
7. Observe: nothing happens, status stays "waiting"
8. Check server logs: `cat server/server.log`

---

## How to Run Locally (for debugging)

```bash
# Terminal 1: Server
cd server
cp .env.example .env  # edit CORS_ORIGIN to http://localhost:3000
npm install
npm run dev

# Terminal 2: Frontend
cd ..  # project root
npm install
npm run dev
# Opens at http://localhost:3000
```

For production server on VM:
```bash
cd server
npm run build
cp src/db/schema.sql dist/db/schema.sql
node dist/index.js
# Logs go to stdout, or redirect: node dist/index.js > server.log 2>&1

# Tunnel (separate terminal):
cloudflared tunnel run landscape-game
```

---

## Debug Logging Already Added

`server/src/index.ts` has console.log statements on the `admin:start-round` handler:
- `[Admin] start-round rejected: socket X not in socketPlayerMap` — join didn't happen
- `[Admin] start-round auth failed: expected=X, got=Y` — token mismatch
- `[Admin] start-round authorized for session X, status=Y` — success (never seen yet)
