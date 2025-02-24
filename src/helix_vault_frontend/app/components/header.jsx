"use client";

import React from "react";
import InternetIdentity from "./idfinity";

const Header = ({
  actor,
  setActor,
  isAuthenticated,
  setIsAuthenticated,
  setAuthClient,
  authClient,
  principal,
  setPrincipal,
}) => {
  return (
    <header className="bg-blue-600 mb-2 p-4 text-white">
      <div className="mx-auto flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-4xl font-bold">Helix Vault</h1>
        <div className="flex items-center">
          <InternetIdentity
            setActor={setActor}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            setAuthClient={setAuthClient}
            authClient={authClient}
            principal={principal}
            setPrincipal={setPrincipal}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
