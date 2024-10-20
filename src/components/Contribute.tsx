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
    process.env.NEXT_PUBLIC_NETWORK_ENV === "Preview"
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
      const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREVIEW || "";
      const networkEnv = "Preview"; // Use the Preview network

      // Initialize Lucid
      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${networkEnv.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostApiKey
        ),
        networkEnv
      );

      const validatorScript = "5903a1010100323232323232322533300232323232325332330083001300937540042646464a664660186002601a6ea801c4c8c94ccc044c0500084c8c8c8c8c8c8c94ccc054c038c058dd500089919191919299980d1807980d9baa001132323232533301e3013301f3754002264a66603e66ebc0280104c8c8c8c8c8c94ccc094c078c098dd51815181580109919191919192999815981218161baa3030303100213232533303030330021323232323253330323375e6e98040dd30050a99981919baf00e008153330323375e604860686ea8048c090c0d0dd50060a99981919b8f00548811ccbdfd7bce097ec3041a4dafb68621cdf88eef0caecd89b19bfd6571500153330320011302b00214a029405280a5014a0a666062604c60646ea930103d87a800013371e0046eb8c0d8c0ccdd5260103d87a800014a26eb4c0d4c0d8008dd7181a000981a0011bae303200116375860620026466002002646600200201644a666062002297adef6c6013232323253330323372291100002153330323371e91010000210031005133036337606ea4008dd3000998030030019bab3033003375c6062004606a004606600244a666060002297ae01323332223233001001003225333036001100313233038374e660706ea4018cc0e0c0d4004cc0e0c0d80052f5c066006006607400460700026eb8c0bc004dd5981800099801801981a00118190008b181780098178011bab302d001302d002302b0013027375400e2c605200260520046eacc09c004c09c008c094004c084dd50018b181198101baa001163300c006005302130220023020001301c3754603e60386ea800458cc020dd6180f0019bad301e4bd7081010000810100001bad301d301e4bd709010000810100001bac301c301d301d001301837540066034602e6ea800458c064c068c068008c060004c050dd518019980b0079980b0069980b19ba548008cc058024cc0594ccc048c01cc04cdd5004098019980b18019980b1ba732330010013758600a602a6ea8c060c054dd500491299980b8008a5eb804cc060c064004cc008008c0680052f5c097ae014c0103d87a80004bd7025eb80c0040048894ccc0580085300103d87a8000132325333015300a00313006330190024bd70099980280280099b8000348004c06800cc060008dd2a4000460280022c6eb4c048004c038dd50039b874800058c03cc040008c038004c028dd50011b874800858c02cc030008c028004c028008c020004c010dd50008a4c26cacae6955ceaab9e5573eae815d0aba201"; // Your validator script here
      const validator: SpendingValidator = {
        type: "PlutusV3",  // Change from "PlutusV3" to "PlutusV2" if necessary
        script: validatorScript,
      };

      const contractAddress = validatorToAddress(
        networkEnv === "Preview" ? "Preview" : "Mainnet",
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
            href={`https://preview.cardanoscan.io/transaction/${txHash}`}
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
