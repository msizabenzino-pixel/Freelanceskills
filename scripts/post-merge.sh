#!/bin/bash
set -e

echo "[post-merge] Installing dependencies..."
npm install --legacy-peer-deps

echo "[post-merge] Building production bundle..."
npm run build

echo "[post-merge] Done."
