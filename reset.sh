#!/bin/bash

echo "🛑 Stopping dfx..."
dfx stop

echo "🧹 Cleaning build and state..."
rm -rf .dfx target

echo "🚀 Starting local replica..."
dfx start --clean --background

echo "📦 Creating core_vault_backend canister..."
dfx canister create core_vault_backend

echo "🔨 Building core_vault_backend..."
dfx build core_vault_backend

echo "📥 Installing core_vault_backend..."
dfx canister install core_vault_backend --mode=install --argument '()'

echo "✅ Reset complete."
