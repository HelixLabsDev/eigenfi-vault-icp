dfx stop
rm -rf .dfx target
dfx start --background
dfx canister create core_vault_backend
dfx build core_vault_backend
dfx canister install core_vault_backend --mode=install --argument '()'
