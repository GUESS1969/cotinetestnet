"use client";
import React, { useEffect } from "react";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import Image from "next/image";
import dynamic from 'next/dynamic';

declare global {
  interface Window {
    my_modal: HTMLDialogElement;
  }
}

type WalletModalProps = {
  onClose: () => void;
};

const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const network =
    process.env.NEXT_PUBLIC_NETWORK_ENV === "Preprod"
      ? NetworkType.TESTNET
      : NetworkType.MAINNET;

  const { isConnected, connect, disconnect, installedExtensions } = useCardano({
    limitNetwork: network, // Dynamically switch between Testnet and Mainnet
  });

  // Automatically close modal when wallet is connected
  useEffect(() => {
    if (isConnected) {
      window.my_modal.close(); // Close the modal
      onClose(); // Trigger the onClose prop to ensure the modal state is managed
    }
  }, [isConnected, onClose]);

  return (
    <div>
      {/* Modal for wallet selection */}
      <dialog
        id="my_modal"
        className="modal modal-open bg-white rounded-lg shadow-lg p-8 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
      >
        <form method="dialog" className="modal-box w-full bg-gray-100 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Connectez votre wallet pour rejoindre le fonds</h2>
          <div className="flex flex-col gap-4">
            {installedExtensions.map((provider: string) => (
              <div
                key={provider}
                className="flex justify-between items-center border p-3 rounded-lg bg-white hover:shadow-md cursor-pointer transition-all duration-300"
                onClick={() => connect(provider)}
              >
                <span className="text-lg font-semibold">{provider.toUpperCase()}</span>
                <Image
                  src={window.cardano[provider].icon}
                  alt={provider}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              className="btn btn-secondary py-2 px-6 rounded-full transition-all duration-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default dynamic(() => Promise.resolve(WalletModal), { ssr: false });
