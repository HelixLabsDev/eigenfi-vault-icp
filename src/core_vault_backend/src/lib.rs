pub mod governance;
pub mod types;
mod vault_factory;

use governance::*;
use types::*;
use ic_cdk_macros::*;
use std::result::Result;
use candid::{CandidType, Deserialize};
use std::collections::HashMap;

/// Called once at canister initialization
#[init]
fn init() {
    init_state();
}

/// Submit a new governance proposal
#[update]
fn submit_proposal(proposal: GovernanceProposal) -> u64 {
    submit_proposal_impl(proposal)
}

#[derive(CandidType, Deserialize)]
enum VoteResult {
    Ok,
    Err(String),
}

#[update]
fn vote_proposal(id: u64, approve: bool) -> VoteResult {
    match vote_proposal_impl(id, approve) {
        Ok(_) => VoteResult::Ok,
        Err(e) => VoteResult::Err(e),
    }
}

#[update]
async fn execute_proposal(id: u64) -> VoteResult {
    match execute_proposal_impl(id).await {
        Ok(_) => VoteResult::Ok,
        Err(e) => VoteResult::Err(e),
    }
}

/// Get a specific proposal by ID
#[query]
fn get_proposal(id: u64) -> Option<GovernanceProposal> {
    get_proposal_impl(id)
}

/// List all governance proposals
#[query]
fn list_proposals() -> Vec<GovernanceProposal> {
    list_proposals_impl()
}
