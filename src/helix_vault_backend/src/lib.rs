use std::collections::HashMap;
use std::cell::RefCell;
use candid::{CandidType, Deserialize, Nat};
use ic_principal::Principal;
use ic_cdk::call;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

const ICRC1_LEDGER_CANISTER_ID: &str = "bkyz2-fmaaa-aaaaa-qaaaq-cai"; // Set your actual Ledger ID

#[derive(CandidType, Deserialize, Default, Clone)]
pub struct UserBalance {
    pub balance: Nat,
}

// Persistent storage for user balances
thread_local! {
    static USER_BALANCES: RefCell<HashMap<Principal, UserBalance>> = RefCell::new(HashMap::new());
    static TOTAL_DEPOSITED: RefCell<Nat> = RefCell::new(Nat::from(0u64)); // Track Total Deposited Amount
}

// Function 1: Get Balance of a Specific User
#[ic_cdk::query]
fn get_user_balance(user: Principal) -> Nat {
    USER_BALANCES.with(|balances| {
        let user_balances = balances.borrow();
        user_balances.get(&user).map_or(Nat::from(0u64), |b| b.balance.clone())
    })
}

// ✅ Function 2: Get Total Deposited Amount in Vault
#[ic_cdk::query]
fn get_vault_balance() -> Nat {
    TOTAL_DEPOSITED.with(|total| total.borrow().clone())
}

// ✅ Function 3: Deposit ICRC-1 Tokens (Updated to Track Total Deposits)
#[ic_cdk::update]
async fn deposit_icrc1(amount: u64) -> Result<String, String> {
    if amount == 0 {
        return Err("Deposit amount must be greater than zero".to_string());
    }

    let caller = ic_cdk::api::caller();
    let token_canister: Principal = ICRC1_LEDGER_CANISTER_ID.parse().unwrap();

    let transfer_arg = TransferFromArgs { // ✅ Use the correct struct
        spender_subaccount: None,
        from: Account { owner: caller, subaccount: None },
        to: Account { owner: ic_cdk::id(), subaccount: None }, // ✅ Send to Vault
        amount: amount.into(),
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    match call::<(TransferFromArgs,), (Result<Nat, TransferFromError>,)>(
        token_canister, "icrc2_transfer_from", (transfer_arg,)
    ).await {
        Ok((Ok(_block_index),)) => {
            USER_BALANCES.with(|balances| {
                let mut user_balances = balances.borrow_mut();
                let user_balance = user_balances.entry(caller).or_insert(UserBalance { balance: Nat::from(0u64) });
                user_balance.balance += Nat::from(amount);
            });

            // ✅ Update TOTAL DEPOSITED BALANCE
            TOTAL_DEPOSITED.with(|total| {
                let mut total_deposited = total.borrow_mut();
                *total_deposited += Nat::from(amount);
            });

            Ok("Deposit successful".to_string())
        },
        Ok((Err(e),)) => Err(format!("Transfer failed: {:?}", e)),
        Err(e) => Err(format!("Call failed: {:?}", e)),
    }
}
// ✅ Function 4: Withdraw ICRC-1 Tokens (Updated to Reduce Total Deposits)
#[ic_cdk::update]
async fn withdraw_icrc1(amount: u64) -> Result<String, String> {
    if amount == 0 {
        return Err("Withdrawal amount must be greater than zero".to_string());
    }

    let caller = ic_cdk::api::caller();
    let token_canister: Principal = ICRC1_LEDGER_CANISTER_ID.parse().unwrap();

    let withdraw_allowed = USER_BALANCES.with(|balances| {
        let mut user_balances = balances.borrow_mut();
        if let Some(user_balance) = user_balances.get_mut(&caller) {
            if user_balance.balance < Nat::from(amount) {
                return false;
            }
            user_balance.balance -= Nat::from(amount);
            true
        } else {
            false
        }
    });

    if !withdraw_allowed {
        return Err("Not enough balance in Helix Vault".to_string());
    }

    let transfer_arg = TransferArg {
        from_subaccount: None,
        to: Account { owner: caller, subaccount: None }, // Tokens go back to user
        amount: amount.into(),
        fee: None,
        memo: None,
        created_at_time: None,
    };

    match call::<(TransferArg,), (Result<Nat, TransferError>,)>(
        token_canister,
        "icrc1_transfer",
        (transfer_arg,)
    ).await {
        Ok((Ok(_block_index),)) => {
            // Reduce TOTAL DEPOSITED BALANCE
            TOTAL_DEPOSITED.with(|total| {
                let mut total_deposited = total.borrow_mut();
                if *total_deposited >= Nat::from(amount) {
                    *total_deposited -= Nat::from(amount);
                } else {
                    *total_deposited = Nat::from(0u64); // Just in case
                }
            });

            Ok("Withdrawal successful".to_string())
        },
        Ok((Err(e),)) => Err(format!("Transfer failed: {:?}", e)),
        Err(e) => Err(format!("Call failed: {:?}", e)),
    }
}
