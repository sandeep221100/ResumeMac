#!/bin/bash
# ────────────────────────────────────────────────────────────
# Resume Redefined — Clean Restart Helper
# Run this when you hit port conflicts or PostgreSQL errors.
# Usage:  bash cleanup.sh
# ────────────────────────────────────────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Resume Redefined — Clean Restart Helper       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Kill processes on backend port ──
BACKEND_PORT="${PORT:-5001}"
echo "→ Checking port $BACKEND_PORT ..."
PIDS=$(lsof -ti :"$BACKEND_PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "  Found process(es) $PIDS on port $BACKEND_PORT — killing them."
  echo "$PIDS" | xargs kill -9 2>/dev/null || true
  echo "  ✓ Port $BACKEND_PORT is now free."
else
  echo "  ✓ Port $BACKEND_PORT is already free."
fi

# ── 2. Kill processes on frontend port ──
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
echo "→ Checking port $FRONTEND_PORT ..."
PIDS=$(lsof -ti :"$FRONTEND_PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "  Found process(es) $PIDS on port $FRONTEND_PORT — killing them."
  echo "$PIDS" | xargs kill -9 2>/dev/null || true
  echo "  ✓ Port $FRONTEND_PORT is now free."
else
  echo "  ✓ Port $FRONTEND_PORT is already free."
fi

# ── 3. Fix PostgreSQL stale launchd / PID lock ──
echo "→ Checking PostgreSQL ..."
if command -v brew &>/dev/null; then
  # Stop the service first
  brew services stop postgresql@16 2>/dev/null || true

  # Boot out stale launchd agent
  PLIST="$HOME/Library/LaunchAgents/homebrew.mxcl.postgresql@16.plist"
  if [ -f "$PLIST" ]; then
    launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
    echo "  ✓ Booted out stale launchd agent."
  fi

  # Kill lingering postgres processes
  killall -9 postgres 2>/dev/null || true
  echo "  ✓ Killed lingering postgres processes."

  # Remove orphaned PID lock file
  PID_FILE="/opt/homebrew/var/postgresql@16/postmaster.pid"
  if [ -f "$PID_FILE" ]; then
    rm -f "$PID_FILE"
    echo "  ✓ Removed orphaned postmaster.pid."
  fi

  # Restart PostgreSQL
  brew services start postgresql@16
  sleep 2

  # Verify
  if pg_isready &>/dev/null; then
    echo "  ✓ PostgreSQL is running and accepting connections."
  else
    echo "  ✗ PostgreSQL may not have started. Check: cat /opt/homebrew/var/log/postgresql@16.log"
  fi

  # Ensure postgres role exists
  if createuser -s postgres 2>/dev/null; then
    echo "  ✓ Created 'postgres' superuser role."
  else
    echo "  ✓ 'postgres' role already exists."
  fi

  # Ensure database exists
  if createdb resumeredefined 2>/dev/null; then
    echo "  ✓ Created 'resumeredefined' database."
  else
    echo "  ✓ 'resumeredefined' database already exists."
  fi
else
  echo "  Homebrew not found — skipping PostgreSQL checks."
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Cleanup complete! You can now start the app:  ║"
echo "║                                                  ║"
echo "║   Tab 1 (backend):                               ║"
echo "║   PORT=5001 JWT_SECRET=your-secret \\             ║"
echo "║   DATABASE_URL=postgresql://postgres@localhost \\ ║"
echo "║   :5432/resumeredefined \\                        ║"
echo "║   pnpm --filter @workspace/api-server run dev    ║"
echo "║                                                  ║"
echo "║   Tab 2 (frontend):                              ║"
echo "║   pnpm --filter @workspace/job-application-\\     ║"
echo "║   master-profile run dev                         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
