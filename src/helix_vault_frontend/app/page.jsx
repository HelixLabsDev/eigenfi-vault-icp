"use client";

import { useEffect, useState } from "react";
// import { createActor } from "../../declarations/helix_vault_backend";
import { createActor } from "../../declarations/icrc1-ledger";
import Header from "./components/header";
import { Principal } from "@dfinity/principal"; // ✅ Import Principal

export default function Home() {
  const [balance, setBalance] = useState();
  const [userBalance, setUserBalance] = useState();

  const [principal, setPrincipal] = useState();

  const [authClient, setAuthClient] = useState();
  const sayGreeting = async () => {
    const balance = await actor.get_vault_balance();
    // const user =
    //   (await principal.length) > 0 && (await actor.get_user_balance(principal));
    // console.log("user", user);
    // setUserBalance(user);
    setBalance(balance);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalSupply, setTotalSupply] = useState("");
  const [actor, setActor] = useState();
  const [tokenCreated, setTokenCreated] = useState(false);
  const [decimals, setDecimals] = useState(0n);

  const updateSupply = async () => {
    try {
      const supply = await actor.icrc1_total_supply();
      const decimals = BigInt(await actor.icrc1_decimals());
      setTotalSupply(`${Number(supply) / Number(10n ** decimals)}`);
      setDecimals(decimals);
    } catch (error) {
      console.error("Error fetching total supply:", error);
    }
  };

  const checkTokenCreated = async () => {
    try {
      const result = await actor.token_created();
      setTokenCreated(result);
    } catch (error) {
      console.error("Error fetching token created status:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated || tokenCreated) {
      updateSupply();
    }
  }, [isAuthenticated, tokenCreated]);

  useEffect(() => {
    if (actor) {
      checkTokenCreated();
      sayGreeting();
    }
  }, [actor]);

  const deposit = async () => {
    const res = await actor.deposit_icrc1(100);
    console.log("res", res);
  };
  const withdraw = async () => {
    const res = await actor.withdraw_icrc1(100);
    console.log("res", res);
  };

  const approve = async () => {
    try {
      const identity = authClient.getIdentity();
      const decimals = BigInt(8);
      const amount = BigInt(10) ** decimals; // Example: 100 tokens
      const actor = createActor("dlbnd-beaaa-aaaaa-qaana-cai", {
        agentOptions: {
          identity,
        },
      });

      // ✅ Set the correct fee (10_000_000n)
      const feeAmount = BigInt(10_000_000); // Correct fee
      const memoBytes = new Uint8Array([1, 2, 3, 4]); // Example memo (optional)
      const createdAtTime = BigInt(Date.now()) * BigInt(1_000_000); // Convert ms to ns
      const expirationTime = createdAtTime + BigInt(3600 * 1_000_000_000); // Expires in 1 hour

      const res = await actor.icrc2_approve({
        fee: [feeAmount], // ✅ Fixed: Now we include the expected fee!
        from_subaccount: [], // ✅ Optional: `[]` if not using subaccounts
        memo: [memoBytes], // ✅ Optional: `[]` if no memo
        created_at_time: [createdAtTime], // ✅ Optional: `[]` if not setting time
        amount: amount, // Required
        expected_allowance: [], // ✅ Optional: `[]` if no expected allowance
        expires_at: [expirationTime], // ✅ Optional: `[]` if no expiration
        spender: {
          owner: Principal.fromText("dzh22-nuaaa-aaaaa-qaaoa-cai"), // ✅ FIXED! Converted to Principal type
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
      <h1>Vault balance: {balance}</h1>
      <h1>Vault balance: {userBalance}</h1>

      <Header
        actor={actor}
        setActor={setActor}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        tokenCreated={tokenCreated}
        setTokenCreated={setTokenCreated}
        setAuthClient={setAuthClient}
        authClient={authClient}
        principal={principal}
        setPrincipal={setPrincipal}
      />

      <button style={{ padding: "4px", borderRadius: "4px" }} onClick={deposit}>
        deposit
      </button>
      <button
        style={{ padding: "4px", borderRadius: "4px" }}
        onClick={withdraw}
      >
        withdraw
      </button>
      <button style={{ padding: "4px", borderRadius: "4px" }} onClick={approve}>
        Approve
      </button>
    </div>
  );
}
