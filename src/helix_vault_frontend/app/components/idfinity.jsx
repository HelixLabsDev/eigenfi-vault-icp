"use client";
import React, { useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "../../../declarations/helix_vault_backend";

const identityProvider = "http://br5f7-7uaaa-aaaaa-qaaca-cai.localhost:4943"; // Local

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
    const identity = authClient.getIdentity();
    const actor = createActor("be2us-64aaa-aaaaa-qaabq-cai", {
      agentOptions: {
        identity,
      },
    });
    const isAuthenticated = await authClient.isAuthenticated();

    setActor(actor);
    setAuthClient(authClient);
    setIsAuthenticated(isAuthenticated);
    setPrincipal(identity.getPrincipal().toString());
  }

  console.log("principal ->", principal);

  async function login() {
    await authClient.login({
      identityProvider,
      onSuccess: updateActor,
    });
  }

  async function logout() {
    await authClient.logout();
    updateActor();
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
