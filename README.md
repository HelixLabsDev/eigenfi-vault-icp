# `eigenfi-vault-icp`

This repository provides the smart contract and frontend integration for the **Helix Vault** on the Internet Computer. It supports ICRC-1 token deposits, EVM minting integration, and cross-chain interactions via backend and frontend canisters.

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone git@github.com:HelixLabsDev/eigenfi-vault-icp.git && cd eigenfi-vault-icp
```

### 2️⃣ Start the Local Replica

```bash
dfx start --background
```

### 3️⃣ Configure Vault Backend

Open the Rust backend file:

```bash
nano src/helix_vault_backend/src/lib.rs
```

Modify the following constants:

```rust
const ICRC1_LEDGER_CANISTER_ID: &str = "ahw5u-keaaa-aaaaa-qaaha-cai";
const EVM_BACKEND_CANISTER_ID: &str = "b77ix-eeaaa-aaaaa-qaada-cai";
```

### 4️⃣ Deploy Vault Backend

```bash
dfx deploy helix_vault_backend
```

Copy the returned canister ID and update this file:

```ts
// src/helix_vault_frontend/lib/constant.ts

const vaultActorAddress = "your-helix-vault-backend-canister-id";
const vaultPrincipal = "your-helix-vault-backend-canister-id";
```

### 5️⃣ Deploy Internet Identity

```bash
dfx deploy internet_identity
```

Update `constant.ts` with the new ID:

```ts
const IDENTITY_URL = "http://your-internet-identity-canister-id.localhost:4943";
```

### 6️⃣ Add Ledger Canister ID

```ts
const ledgerActorAddress = "your-canister-id";
```

---

## 🔄 Generate Declarations

```bash
dfx generate helix_vault_backend
```

Copy the generated folders:

```bash
cp -r .dfx/local/canisters/helix_vault_backend/declarations/helix_vault_backend
```

paste here: src/helix_vault_frontend/

## 🚀 Deploy Frontend

```bash
cd src/helix_vault_frontend && npm install && cd ../..
```

```bash
./deploy_front.sh
```

---

## 📄 License

MIT © Helix Labs
