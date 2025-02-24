"use client";

import { useEffect, useState } from "react";
import { createActor as createVaultActor } from "../declarations/helix_vault_backend"; // Vault actor
import { createActor as createLedgerActor } from "../declarations/icrc1-ledger"; // Ledger actor
import Header from "./components/header";
import { Principal } from "@dfinity/principal";

export default function Home() {
  const [balance, setBalance] = useState(null); // Vault balance
  const [userBalance, setUserBalance] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalSupply, setTotalSupply] = useState("");
  const [vaultActor, setVaultActor] = useState(null); // Renamed for clarity
  const [ledgerActor, setLedgerActor] = useState(null); // For ledger operations
  const [decimals, setDecimals] = useState(0n);

  // Fetch vault balances
  const sayGreeting = async () => {
    if (vaultActor && principal) {
      const balance = await vaultActor.get_vault_balance();
      const user = await vaultActor.get_user_balance(
        Principal.fromText(principal)
      );
      setBalance(balance.toString());
      setUserBalance(user.toString());
    }
  };

  // Fetch ledger total supply
  const updateSupply = async () => {
    if (ledgerActor) {
      try {
        const supply = await ledgerActor.icrc1_total_supply();
        const decimals = BigInt(await ledgerActor.icrc1_decimals());
        setTotalSupply(`${Number(supply) / Number(10n ** decimals)}`);
        setDecimals(decimals);
      } catch (error) {
        console.error("Error fetching total supply:", error);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      updateSupply();
      sayGreeting();
    }
  }, [isAuthenticated, vaultActor, ledgerActor, principal]);

  const deposit = async () => {
    if (vaultActor) {
      const res = await vaultActor.deposit_icrc1(BigInt(20000));
      console.log("Deposit result:", res);
      sayGreeting(); // Refresh balances
    }
  };

  const withdraw = async () => {
    if (vaultActor) {
      const res = await vaultActor.withdraw_icrc1(BigInt(100));
      console.log("Withdraw result:", res);
      sayGreeting(); // Refresh balances
    }
  };

  const approve = async () => {
    if (!authClient) return;
    try {
      const identity = authClient.getIdentity();
      const decimals = BigInt(8);
      const amount = BigInt(10) ** decimals; // 1 token
      const feeAmount = BigInt(10000); // Ledger fee (0.0001 tokens)

      const ledgerActor = createLedgerActor("bw4dl-smaaa-aaaaa-qaacq-cai", {
        agentOptions: { identity },
      });

      const res = await ledgerActor.icrc2_approve({
        fee: [feeAmount],
        from_subaccount: [],
        memo: [],
        created_at_time: [],
        amount: amount,
        expected_allowance: [],
        expires_at: [],
        spender: {
          owner: Principal.fromText("a3shf-5eaaa-aaaaa-qaafa-cai"),
          subaccount: [],
        },
      });

      console.log("Approval Success:", res);
    } catch (error) {
      console.error("Approval Failed:", error);
    }
  };

  return (
    <div>
      <h1>Vault Balance: {balance || "N/A"}</h1>
      <h1>User Balance: {userBalance || "N/A"}</h1>
      <h1>Ledger Total Supply: {totalSupply || "N/A"}</h1>

      <Header
        actor={vaultActor}
        setActor={setVaultActor}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        setAuthClient={setAuthClient}
        authClient={authClient}
        principal={principal}
        setPrincipal={setPrincipal}
      />

      <button style={{ padding: "4px", borderRadius: "4px" }} onClick={deposit}>
        Deposit
      </button>
      <button
        style={{ padding: "4px", borderRadius: "4px" }}
        onClick={withdraw}
      >
        Withdraw
      </button>
      <button style={{ padding: "4px", borderRadius: "4px" }} onClick={approve}>
        Approve Vault
      </button>
    </div>
  );
}
