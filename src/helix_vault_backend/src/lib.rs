use std::collections::HashMap;
use std::cell::RefCell;
use candid::{CandidType, Deserialize, Nat};
use ic_principal::Principal;
use ic_cdk::call;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

const ICRC1_LEDGER_CANISTER_ID: &str = "gl6nx-5maaa-aaaaa-qaaqq-cai";

#[derive(CandidType, Deserialize, Default, Clone)]
struct UserBalance {
    balance: Nat,
}

thread_local! {
    static USER_BALANCES: RefCell<HashMap<Principal, UserBalance>> = RefCell::new(HashMap::new());
    static TOTAL_DEPOSITED: RefCell<Nat> = RefCell::new(Nat::from(0u64));
    static TRANSFER_FEE: RefCell<Nat> = RefCell::new(Nat::from(10_000_u64)); // Default fee, updated lazily
}

#[ic_cdk::query]
fn get_user_balance(user: Principal) -> Nat {
    USER_BALANCES.with(|balances| {
        balances.borrow().get(&user).map_or(Nat::from(0u64), |b| b.balance.clone())
    })
}

#[ic_cdk::query]
fn get_vault_balance() -> Nat {
    TOTAL_DEPOSITED.with(|total| total.borrow().clone())
}

#[ic_cdk::query]
fn get_transfer_fee() -> Nat {
    TRANSFER_FEE.with(|fee| fee.borrow().clone())
}

#[ic_cdk::update]
async fn deposit_icrc1(amount: Nat) -> Result<String, String> {
    if amount == Nat::from(0u64) {
        return Err("Deposit amount must be greater than zero".to_string());
    }

    let caller = ic_cdk::api::caller();
    let token_canister: Principal = ICRC1_LEDGER_CANISTER_ID.parse().unwrap();

    // Fetch or update the fee lazily
    let fee = TRANSFER_FEE.with(|f| f.borrow().clone());
    let fee = if fee == Nat::from(10_000_u64) { // Still default
        match call::<(), (Nat,)>(token_canister, "icrc1_fee", ()).await {
            Ok((new_fee,)) => {
                TRANSFER_FEE.with(|f| *f.borrow_mut() = new_fee.clone());
                new_fee
            }
            Err(_) => fee, // Use default if fetch fails
        }
    } else {
        fee
    };

    if amount <= fee {
        return Err(format!("Deposit must exceed the transfer fee of {} units", fee));
    }

    let transfer_arg = TransferFromArgs {
        spender_subaccount: None,
        from: Account { owner: caller, subaccount: None },
        to: Account { owner: ic_cdk::id(), subaccount: None },
        amount: amount.clone(),
        fee: Some(fee.clone()),
        memo: None,
        created_at_time: None,
    };

    match call::<(TransferFromArgs,), (Result<Nat, TransferFromError>,)>(
        token_canister,
        "icrc2_transfer_from",
        (transfer_arg,),
    )
    .await
    {
        Ok((Ok(_block_index),)) => {
            let effective_amount = amount;
            USER_BALANCES.with(|balances| {
                let mut user_balances = balances.borrow_mut();
                let user_balance = user_balances
                    .entry(caller)
                    .or_insert(UserBalance { balance: Nat::from(0u64) });
                user_balance.balance += effective_amount.clone();
            });
            TOTAL_DEPOSITED.with(|total| {
                let mut total_deposited = total.borrow_mut();
                *total_deposited += effective_amount;
            });
            Ok("Deposit successful".to_string())
        }
        Ok((Err(e),)) => Err(format!("Transfer failed: {:?}", e)),
        Err(e) => Err(format!("Call failed: {:?}", e)),
    }
}

#[ic_cdk::update]
async fn withdraw_icrc1(amount: Nat) -> Result<String, String> {
    if amount == Nat::from(0u64) {
        return Err("Withdrawal amount must be greater than zero".to_string());
    }

    let caller = ic_cdk::api::caller();
    let token_canister: Principal = ICRC1_LEDGER_CANISTER_ID.parse().unwrap();
    let fee = TRANSFER_FEE.with(|f| f.borrow().clone());
    let total_needed = amount.clone() + fee.clone();

    let vault_ledger_balance = match call::<(Account,), (Nat,)>(
        token_canister,
        "icrc1_balance_of",
        (Account { owner: ic_cdk::id(), subaccount: None },),
    )
    .await
    {
        Ok((balance,)) => balance,
        Err(e) => return Err(format!("Failed to fetch vault balance: {:?}", e)),
    };

    let withdraw_allowed = USER_BALANCES.with(|balances| {
        let mut user_balances = balances.borrow_mut();
        if let Some(user_balance) = user_balances.get_mut(&caller) {
            if user_balance.balance < amount || vault_ledger_balance < total_needed {
                return false;
            }
            user_balance.balance -= amount.clone();
            true
        } else {
            false
        }
    });

    if !withdraw_allowed {
        return Err(format!(
            "Insufficient balance: need {} units (vault pays {} fee), user has {}, vault has {}",
            amount,
            fee,
            get_user_balance(caller),
            vault_ledger_balance
        ));
    }

    let transfer_arg = TransferArg {
        from_subaccount: None,
        to: Account { owner: caller, subaccount: None },
        amount: amount.clone(),
        fee: Some(fee.clone()),
        memo: None,
        created_at_time: None,
    };

    match call::<(TransferArg,), (Result<Nat, TransferError>,)>(
        token_canister,
        "icrc1_transfer",
        (transfer_arg,),
    )
    .await
    {
        Ok((Ok(_block_index),)) => {
            TOTAL_DEPOSITED.with(|total| {
                let mut total_deposited = total.borrow_mut();
                *total_deposited -= amount.clone();
            });
            Ok(format!("Withdrawal successful, {} units sent (vault paid {} fee)", amount, fee))
        }
        Ok((Err(e),)) => {
            USER_BALANCES.with(|balances| {
                let mut user_balances = balances.borrow_mut();
                if let Some(user_balance) = user_balances.get_mut(&caller) {
                    user_balance.balance += amount.clone();
                }
            });
            Err(format!("Transfer failed: {:?}", e))
        }
        Err(e) => {
            USER_BALANCES.with(|balances| {
                let mut user_balances = balances.borrow_mut();
                if let Some(user_balance) = user_balances.get_mut(&caller) {
                    user_balance.balance += amount.clone();
                }
            });
            Err(format!("Call failed: {:?}", e))
        }
    }
}

#[ic_cdk::update]
async fn sync_state() -> Result<(), String> {
    let token_canister: Principal = ICRC1_LEDGER_CANISTER_ID.parse().unwrap();
    let balance = match call::<(Account,), (Nat,)>(
        token_canister,
        "icrc1_balance_of",
        (Account { owner: ic_cdk::id(), subaccount: None },),
    )
    .await
    {
        Ok((balance,)) => balance,
        Err(e) => return Err(format!("Failed to sync vault balance: {:?}", e)),
    };
    let fee = match call::<(), (Nat,)>(token_canister, "icrc1_fee", ()).await {
        Ok((fee,)) => fee,
        Err(e) => return Err(format!("Failed to sync fee: {:?}", e)),
    };

    TOTAL_DEPOSITED.with(|total| *total.borrow_mut() = balance);
    TRANSFER_FEE.with(|f| *f.borrow_mut() = fee);
    Ok(())
}