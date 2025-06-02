use crate::types::*;
use std::cell::RefCell;
use ic_cdk::api;
use std::collections::HashSet;
use ic_principal::Principal;

thread_local! {
    static PROPOSALS: RefCell<Vec<GovernanceProposal>> = RefCell::new(Vec::new());
    static NEXT_ID: RefCell<u64> = RefCell::new(0);
}

// Initialize canister state
pub fn init_state() {
    NEXT_ID.with(|id| *id.borrow_mut() = 0);
    PROPOSALS.with(|p| p.borrow_mut().clear());
}

// Submit a new proposal
pub fn submit_proposal_impl(mut proposal: GovernanceProposal) -> u64 {
    let now = current_timestamp();

    proposal.id = NEXT_ID.with(|id| {
        let mut counter = id.borrow_mut();
        let assigned_id = *counter;
        *counter += 1;
        assigned_id
    });

    proposal.status = ProposalStatus::Pending;
    proposal.votes_for = 0;
    proposal.votes_against = 0;
    proposal.deadline = now + 60 * 60 * 24;
    proposal.voters = HashSet::new();

    PROPOSALS.with(|p| p.borrow_mut().push(proposal.clone()));

    proposal.id
}


// Cast a vote on a proposal
pub fn vote_proposal_impl(id: u64, approve: bool) -> Result<(), String> {
    let caller = ic_cdk::api::caller();

    PROPOSALS.with(|p| {
        let mut proposals = p.borrow_mut();

        match proposals.iter_mut().find(|p| p.id == id) {
            Some(proposal) => {
                if proposal.status != ProposalStatus::Pending {
                    return Err("Proposal is already finalized".to_string());
                }

                if proposal.voters.contains(&caller) {
                    return Err("You have already voted".to_string());
                }

                proposal.voters.insert(caller);

                if approve {
                    proposal.votes_for += 1;
                } else {
                    proposal.votes_against += 1;
                }

                Ok(())
            }
            None => Err("Proposal not found".to_string()),
        }
    })
}

// Execute proposal based on votes
pub fn execute_proposal_impl(id: u64) -> Result<(), String> {
    PROPOSALS.with(|p| {
        let mut proposals = p.borrow_mut();

        match proposals.iter_mut().find(|p| p.id == id) {
            Some(proposal) => {
                if proposal.status != ProposalStatus::Pending {
                    return Err("Proposal already executed or rejected".to_string());
                }

                let passed = proposal.votes_for > proposal.votes_against;

                proposal.status = if passed {
                    ProposalStatus::Approved
                    // TODO: Execute action like create_vault or upgrade_vault
                } else {
                    ProposalStatus::Rejected
                };

                Ok(())
            }
            None => Err("Proposal not found".to_string()),
        }
    })
}

// Get a specific proposal
pub fn get_proposal_impl(id: u64) -> Option<GovernanceProposal> {
    PROPOSALS.with(|p| p.borrow().iter().find(|p| p.id == id).cloned())
}

// List all proposals
pub fn list_proposals_impl() -> Vec<GovernanceProposal> {
    PROPOSALS.with(|p| p.borrow().clone())
}

// Helper: get current UNIX timestamp
fn current_timestamp() -> u64 {
    api::time() / 1_000_000_000 // convert from nanoseconds to seconds
}