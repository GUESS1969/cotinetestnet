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
  const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV === "Preprod"
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
      const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD || process.env.NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET || "";
      const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV === "Preprod" ? "Preprod" : "Mainnet"; // Use dynamic environment
      
      // Initialize Lucid
      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${networkEnv.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostApiKey
        ),
        networkEnv
      );

      const validatorScript = "5902540101003232323232323225333002323232323253330073370e900118041baa001132323253323300b3001300c375400c26464a66602060260042a66601a6006601c6ea80104c8c94ccc03cc014c040dd5000899299980819198008009bac3016301730173017301730173017301730173013375401c44a66602a00229404c94ccc04ccdc79bae301800200414a22660060060026030002264a666022600e60246ea800454ccc0454ccc050c8cc004004c8cc004004dd5991800980b1baa3001301637546032602c6ea80108c064c068004894ccc05c00452f5bded8c0264646464a66603066e45220100002153330183371e9101000021003100513301c337606ea4008dd3000998030030019bab3019003375c602e0046036004603200244a66602c002297ae0132333222323300100100322533301c00110031323301e374e6603c6ea4018cc078c06c004cc078c0700052f5c0660060066040004603c0026eb8c054004dd5980b00099801801980d001180c0008a5114a029445288b19299980a0008a60103d87a800013374a90001980a980b000a5eb80dd6180198091baa00d16375c602860226ea800458ccc8c0040048894ccc0500085300103d87a8000132325333013300900313374a90001980b9ba90024bd70099980280280099b8000348004c06000cdd7180b0011bac300130103754602660206ea8014dd6980098081baa009230130011616375a6022002601a6ea8018dc3a40002c601c601e004601a00260126ea800458c02cc030008c028004c028008c020004c010dd50008a4c26cacae6955ceaab9e5573eae815d0aba21"; // Your actual CBOR-encoded script
      const validator: SpendingValidator = {
        type: "PlutusV3",  // Adjust to the correct version if needed
        script: validatorScript,
      };

      const contractAddress = validatorToAddress(networkEnv, validator);
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

      // Convert ADA to Lovelace safely
      const amountInLovelace = Number(amountInAda) * 1_000_000;
      if (!amountInLovelace || isNaN(amountInLovelace)) {
        throw new Error("Invalid ADA amount.");
      }

      const tx = await lucid.newTx()
        .pay.ToAddressWithData(contractAddress, { kind: "inline", value: datum }, { lovelace: BigInt(amountInLovelace) })
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
