"use client";
import React, { useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent"; // Add this
import { createActor } from "../../declarations/helix_vault_backend";

const IDENTITY_URL = "http://ajuq4-ruaaa-aaaaa-qaaga-cai.localhost:4943"; // Updated local II canister ID

const InternetIdentity = ({
  setActor,
  isAuthenticated,
  setIsAuthenticated,
  authClient,
  setAuthClient,
  principal,
  setPrincipal,
}) => {
  useEffect(() => {
    updateActor();
  }, []);

  async function updateActor() {
    const authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    setAuthClient(authClient);

    if (isAuthenticated) {
      const identity = authClient.getIdentity();
      const agent = new HttpAgent({ identity, host: "http://localhost:4943" });
      if (process.env.NEXT_PUBLIC_DFX_NETWORK !== "ic") {
        await agent.fetchRootKey(); // Local dev
      }
      const actor = createActor("a3shf-5eaaa-aaaaa-qaafa-cai", { agent });
      setActor(actor);
      setIsAuthenticated(true);
      setPrincipal(identity.getPrincipal().toText());
    } else {
      setIsAuthenticated(false);
      setPrincipal(null);
    }
  }

  async function login() {
    await authClient.login({
      identityProvider: IDENTITY_URL,
      onSuccess: updateActor,
    });
  }

  async function logout() {
    await authClient.logout();
    setActor(null);
    setIsAuthenticated(false);
    setPrincipal(null);
  }

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <p className="text-sm">
            <span className="font-mono">{principal}</span>
          </p>
          <button
            onClick={logout}
            className="transform rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="transform rounded-lg bg-white px-3 py-1 text-sm font-bold text-blue-600 shadow-md transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          Sign In with Internet Identity
        </button>
      )}
    </div>
  );
};

export default InternetIdentity;
