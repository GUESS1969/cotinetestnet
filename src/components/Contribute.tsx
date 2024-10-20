"use client";

import { Lucid, Blockfrost, SpendingValidator, validatorToAddress, Data, getAddressDetails, Constr } from "@lucid-evolution/lucid";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import React, { useState } from "react";
import dynamic from "next/dynamic";

// Helper function to convert a hex string to a Uint8Array
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
};

// Helper function to convert a bech32 address to a public key hash (Uint8Array)
const getPublicKeyHashFromAddress = (address: string): Uint8Array | null => {
  try {
    const details = getAddressDetails(address);
    if (details.paymentCredential && details.paymentCredential.type === "Key") {
      return hexToBytes(details.paymentCredential.hash);
    }
    console.error("Unable to extract payment credential from address:", address);
    return null;
  } catch (error) {
    console.error("Error converting address to public key hash:", error);
    return null;
  }
};

const Contribute = () => {
  const networkEnv =
    process.env.NEXT_PUBLIC_NETWORK_ENV === "Preprod"
      ? NetworkType.TESTNET
      : NetworkType.MAINNET;

  const { isConnected, enabledWallet } = useCardano({
    limitNetwork: networkEnv,
  });

  const [amountInAda, setAmountInAda] = useState<number | string>("");  // Input in ADA
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleContribute = async () => {
    if (!isConnected || !enabledWallet || !amountInAda || isNaN(Number(amountInAda))) {
      setErrorMessage("Invalid input or wallet not connected.");
      return;
    }

    setIsLoading(true);
    setTxHash(null); // Reset the transaction hash
    setErrorMessage(null); // Reset the error message

    try {
      const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD || "";
      const networkEnv = "Preprod"; // Or "Mainnet" depending on your environment

      // Initialize Lucid
      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${networkEnv.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostApiKey
        ),
        networkEnv
      );

      const validatorScript = "cbor"; // Your validator script here
      const validator: SpendingValidator = {
        type: "PlutusV3",  // Change from "PlutusV3" to "PlutusV2"
        script: validatorScript,
      };

      const contractAddress = validatorToAddress(
        networkEnv === "Preprod" ? "Preprod" : "Mainnet",
        validator
      );
      console.log("Contract Address:", contractAddress);

      const api = await window.cardano[enabledWallet].enable();
      lucid.selectWallet.fromAPI(api);

      const walletAddress = await lucid.wallet().address();
      console.log("Connected Wallet Address:", walletAddress);

      const participants = [
        getPublicKeyHashFromAddress("addr_test1qzqj3u3u407gl4jnaujm6w78awnes4rk5pq6extz67ey0urymfwmlan75sp4fm5e5tnfdhzz7lnvq06qkdj7kec5ntds7azxt0"),
        getPublicKeyHashFromAddress("addr_test1qzxm3w8cr2t0da7r6jh5n0h4c49mur07xkjq3l2wu6xhguu0x7zxuq8e6wnvmx67tmkpr7de0guxez98c2knvpmnwmnq4ws9qt"),
      ]
        .filter((participant): participant is Uint8Array => participant !== null)
        .map((participant) => Data.to(Buffer.from(participant).toString("hex")));

      const datum = Data.to(new Constr(0, participants));
      console.log("PARTICIPANTS: ", participants);
      console.log("Datum: ", datum);

      const utxos = await lucid.wallet().getUtxos();
      // const stateTokenUtxo = utxos.find(utxo => utxo.assets["cbdfd7bce097ec3041a4dafb68621cdf88eef0caecd89b19bfd657155374617465546f6b656e"]);
      // console.log("Token: ", stateTokenUtxo);
      // console.log("UTXOS:", utxos);

      // if (!stateTokenUtxo) {
      //   throw new Error("State token UTXO not found in wallet.");
      // }

      // Convert ADA to Lovelace
      const amountInLovelace = BigInt(Number(amountInAda) * 1_000_000);

      const tx = await lucid.newTx()
        // .collectFrom([stateTokenUtxo])
        .pay.ToAddressWithData(contractAddress, { kind: "inline", value: datum }, { lovelace: amountInLovelace })
        .attach.SpendingValidator(validator)
        .complete();

      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();
      setTxHash(txHash);

    } catch (error: unknown) {
      if (error instanceof Error) {
          setErrorMessage(error.message);
          console.error("Error contributing funds:", error.message);
      } else if (typeof error === 'object' && error !== null) {
          const errorObject = JSON.stringify(error, Object.getOwnPropertyNames(error));
          setErrorMessage(errorObject);
          console.error("Error contributing funds:", errorObject);
      } else {
          setErrorMessage("An unknown error occurred.");
          console.error("Unknown error contributing funds:", error);
      }
    } finally {
      setIsLoading(false);  // Stop processing after transaction completes
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded shadow-lg mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Contribuez pour une chance de gagner le fonds à votre tour</h2>
      <div className="mb-4">
        <input
          type="number"
          placeholder="tADA"
          value={amountInAda}
          onChange={(e) => setAmountInAda(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="mb-4">
        <button
          className={`w-full p-3 text-white font-semibold rounded ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={handleContribute}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Déposer"}
        </button>
      </div>
      {txHash && (
        <p className="text-green-500 text-center mt-2">
          Transaction submitted! Check it on{" "}
          <a
            href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Cardano Explorer
          </a>
          .
        </p>
      )}
      {errorMessage && (
        <p className="text-red-500 text-center mt-2">
          Error: {errorMessage}
        </p>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Contribute), { ssr: false });