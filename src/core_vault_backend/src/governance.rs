use crate::types::*;
use std::cell::RefCell;
use ic_cdk::api;
use std::collections::HashSet;
use ic_principal::Principal;

thread_local! {
    static PROPOSALS: RefCell<Vec<GovernanceProposal>> = RefCell::new(Vec::new());
    static NEXT_ID: RefCell<u64> = RefCell::new(0);
    static ALL_VOTERS: RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
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
                let now = current_timestamp();
                if now > proposal.deadline {
                    proposal.status = ProposalStatus::Rejected;
                    return Err("Proposal voting deadline has passed. Proposal rejected.".to_string());
                }
                if proposal.voters.contains(&caller) {
                    return Err("You have already voted".to_string());
                }

                proposal.voters.insert(caller);

                ALL_VOTERS.with(|set| {
                    set.borrow_mut().insert(caller);
                });


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

pub async fn execute_proposal_impl(id: u64) -> Result<(), String> {
    // First, extract proposal out of thread_local so we can `.await` outside
    let mut proposal_opt = None;

    PROPOSALS.with(|p| {
        let mut proposals = p.borrow_mut();
        if let Some(found) = proposals.iter_mut().find(|p| p.id == id) {
            if found.status != ProposalStatus::Pending {
                return;
            }
            proposal_opt = Some(found.clone());
        }
    });

    let mut proposal = proposal_opt.ok_or("Proposal not found".to_string())?;

    if proposal.status != ProposalStatus::Pending {
        return Err("Proposal already finalized.".to_string());
    }

    let now = current_timestamp();
    if now > proposal.deadline {
        proposal.status = ProposalStatus::Rejected;
        update_proposal_status(id, proposal.status.clone());
        return Err("Proposal deadline passed. Auto-rejected.".to_string());
    }

    let total_votes = proposal.votes_for + proposal.votes_against;
    let total_voters = total_registered_voters();
    let quorum_required = ((total_voters as f64) * 0.3).ceil() as u64;

    if total_votes < quorum_required {
        proposal.status = ProposalStatus::Rejected;
        update_proposal_status(id, proposal.status.clone());
        return Err("Quorum not met. Proposal rejected.".to_string());
    }

    let approval_ratio = proposal.votes_for as f64 / total_votes as f64;
    if approval_ratio > 0.51 {
        // ✅ Passed — try to create vault
        if let ProposalAction::CreateVault { token_symbol } = &proposal.action {
            match crate::vault_factory::create_helix_vault(token_symbol.clone()).await {
                Ok(_) => {
                    proposal.status = ProposalStatus::Approved;
                }
                Err(err) => {
                    proposal.status = ProposalStatus::Rejected;
                    update_proposal_status(id, proposal.status.clone());
                    return Err(format!("Vault creation failed: {}", err));
                }
            }
        }
    } else {
        proposal.status = ProposalStatus::Rejected;
    }

    update_proposal_status(id, proposal.status.clone());
    Ok(())
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

fn total_registered_voters() -> usize {
    ALL_VOTERS.with(|set| set.borrow().len())
}

fn update_proposal_status(id: u64, new_status: ProposalStatus) {
    PROPOSALS.with(|p| {
        let mut proposals = p.borrow_mut();
        if let Some(found) = proposals.iter_mut().find(|p| p.id == id) {
            found.status = new_status;
        }
    });
}