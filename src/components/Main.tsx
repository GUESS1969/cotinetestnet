"use client";

import React from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useCardano} from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import dynamic from 'next/dynamic';

type MainProps = {
  children: React.ReactNode;
};

function Main({ children }: MainProps) {
  const { isConnected } = useCardano({
    limitNetwork: process.env.NODE_ENV === "development"
      ? ("testnet" as NetworkType)
      : ("mainnet" as NetworkType),
  });

  return (
    <div>
      <NavBar />
      <main>
        {/* Display Contribute.tsx (children) only if the wallet is connected */}
        {isConnected ? (
          <div>
            {children} {/* Only render the DApp functionality when connected */}
          </div>
        ) : (
          // If the wallet is NOT connected, show the landing page
          <>
            
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default dynamic(() => Promise.resolve(Main), { ssr: false });