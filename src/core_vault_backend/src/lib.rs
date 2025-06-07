pub mod governance;
pub mod types;
mod vault_factory;

use governance::*;
use types::*;
use ic_cdk_macros::*;
use std::result::Result;
use candid::{CandidType, Deserialize};
use candid::Principal;
use ic_cdk::api::time; 
use std::collections::HashSet;

/// Called once at canister initialization
#[init]
fn init() {
    init_state();
}

#[derive(CandidType, Deserialize)]
pub struct ProposalInput {
    pub title: String,
    pub description: String,
    pub action: ProposalAction,
}

#[update]
fn submit_proposal(input: ProposalInput) -> u64 {
    let proposal = GovernanceProposal {
        id: 0, // will be overwritten
        proposer: ic_cdk::api::caller().to_text(),
        title: input.title,
        description: input.description,
        action: input.action,
        status: ProposalStatus::Pending,
        votes_for: 0,
        votes_against: 0,
        deadline: current_timestamp() + 60 * 60 * 24, // 24 hours
        voters: HashSet::new(),
    };

    submit_proposal_impl(proposal)
}

// Add if you don’t already have it
fn current_timestamp() -> u64 {
    time() / 1_000_000_000
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
async fn execute_proposal(id: u64) -> Result<Principal, String> {
    execute_proposal_impl(id).await
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
