"use client";

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from "react";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import WalletModal from "./WalletModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons'; // Example icon for wallet

const WalletConnect = () => {
  const networkEnv =
<<<<<<< HEAD
    process.env.NEXT_PUBLIC_Pre_NETWORK_ENV === "Preview"
=======
    process.env.NEXT_PUBLIC_NETWORK_ENV === "Preview"
>>>>>>> f7581e1 (Updated Contribute, WalletConnect, and WalletModal components)
      ? NetworkType.TESTNET
      : NetworkType.MAINNET;

  const { isConnected, usedAddresses, disconnect, accountBalance } = useCardano({
    limitNetwork: networkEnv,
  });

  const [showModal, setShowModal] = useState(false); // Manage modal visibility

  // Format Cardano address
  const formatAddress = (address: string | undefined) => {
    if (!address) return "Unknown Address";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format balance in ADA
  const formatBalance = (balance: number | string) => {
    const balanceInLovelace = Math.floor(Number(balance) * 1_000_000); 
    const ada = BigInt(balanceInLovelace) / BigInt(1_000_000n); // Convert to ADA
    return `${ada.toString()} ADA`;
  };

  // Check for Cardano wallet presence
  useEffect(() => {
    if (window?.cardano) {
      console.log("Cardano wallet found");
    } else {
      console.log("Cardano wallet not found");
    }
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
      {isConnected ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 bg-gray-100 rounded-lg px-4 py-3">
          {/* Display formatted address */}
          <FontAwesomeIcon icon={faWallet} className="text-gray-500 w-6 h-6" />
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-700">
            {formatAddress(usedAddresses?.[0])}
          </span>

          {/* Display balance in ADA */}
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-700">
            {formatBalance(accountBalance || "0")}
          </span>

          {/* Disconnect Wallet Button */}
          <button
            className="bg-gray-500 text-white text-sm sm:text-base lg:text-lg py-2 px-4 rounded-full hover:bg-gray-600 transition duration-300"
            onClick={() => {
              try {
                disconnect();
              } catch (error) {
                console.error("Error disconnecting wallet:", error);
              }
            }}
          >
            DISCONNECT
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-500 text-white text-sm sm:text-base lg:text-lg py-2 px-6 rounded-full hover:bg-blue-600 transition-all duration-300"
          onClick={() => setShowModal(true)}
        >
          CONNECT
        </button>
      )}

      {/* Modal for wallet connection */}
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

// Export dynamic to disable SSR
export default dynamic(() => Promise.resolve(WalletConnect), { ssr: false });
