"use client";

import { Lucid, Blockfrost, paymentCredentialOf, SpendingValidator, validatorToAddress,  Data, Constr,  fromHex, toHex, UTxO} from "@lucid-evolution/lucid";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import React, { useState } from "react";
import dynamic from "next/dynamic";
//import { Datum, TontineRedeemer, DatumSchema, RedeemerSchema} from "../pages/api/datatypes"; // Import your custom types

/**
 * Converts a Bech32 address to a public key hash (Uint8Array).
 * Uses the getAddressCredential function.
 */
const getPublicKeyHash = async (address: string): Promise<Uint8Array | null> => {
  try {
    const credential = paymentCredentialOf(address);

    if (credential.type === "Key") {
     
      return fromHex(credential.hash);
    }
    return null;
  } catch (error) {
    console.error("Error converting address to public key hash:", error);
    return null;
  }
};


const CheckRedeem = () => {
  const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV === "Mainnet"
    ? NetworkType.MAINNET 
    : NetworkType.TESTNET;

  const { isConnected, enabledWallet } = useCardano({
    limitNetwork: networkEnv,
  });

  const [amountInAda, setAmountInAda] = useState<number | string>("");  
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [redeemTxHash, setRedeemTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [currentRound, setcurrentRound] = useState<bigint>(1n); // Initialize round number as bigint
  const handleContribute = async () => {
    if (!isConnected || !enabledWallet || !amountInAda || isNaN(Number(amountInAda))) {
      setErrorMessage("Invalid input or wallet not connected.");
      return;
    }

    setIsLoading(true);
    setTxHash(null); 
    setErrorMessage(null);

    try {
      const blockfrostApiKey =  process.env.NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET || "";  // process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD ||
      const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV === "Mainnet" // "Preprod" ? "Preprod" : 
      ? NetworkType.MAINNET 
      : NetworkType.TESTNET; 
      
      // Initialize Lucid
      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${networkEnv.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostApiKey
        ),
        "Mainnet"
      );

      const validatorScript = "5904e0010100323232323232322533300232323232325332330083001300937540042646464646464a66601c60060022a66602260206ea8024540085854ccc038c01c0044c8c94ccc04cc0580085401058dd6980a00098081baa00916300e37540102a6660186002601a6ea80084c8c8c8c94c8ccc044ccc044c94ccc048ccc0494ccc0540045288a504a09444ccc048cdd799199800800801260105d8799fa0ff00222533301800210011333003003301b00232325333017301030183754006298103d87a8000132533301853330183330183370e004901c2504a229444c8cc004004008894ccc07400452809919299980e19b9100700113371e00e0022660080080046eb8c070c080008c0800045300103d87a8000130083301c374c646600200200444a66603a00226603c66ec0dd480299980d2514c103d87a80004c0103d87980004bd6f7b630099191919299980f19b90009002133022337606ea4024ccc07928a6103d87a80004c0103d87980000051533301e3371e01200426604466ec0dd480499980f2514c0103d87a80004c0103d8798000003133022337606ea4008ccc078005300103d87a80004c0103d8798000330060060033016301e3754603e0066eb8c074008c084008c07c0052f5c06eacc070c064dd50019b8d001375c6034004980103d87a80004a09445281bac30043013375400a941288a50153330113330110024a09445280a999808999808991919299980a1804980a9baa001153330143370e00460066eacc018c058dd5180c980b1baa00114a2294052819299980b8008a6103d87a8000130043301830190014bd701bac301830193019301537540206466600200264660020026eb0c01cc058dd500891299980c0008a5eb804c8c94ccc05ccdd79805180c9baa00200e13301b00233004004001133004004001301c002301a001480008894ccc06000840044ccc00c00cc06c008cdc000098021bab300730173754600e602e6ea8c0680088c94ccc04cc030c050dd50008a400026eb4c060c054dd50009929998099806180a1baa00114c0103d87a80001323300100137566032602c6ea8008894ccc060004530103d87a800013232323253330193372291100002153330193371e910100002130093301d375000297ae014c0103d87a8000133006006003375a60340066eb8c060008c070008c068004c8cc004004008894ccc05c0045300103d87a800013232323253330183372291100002153330183371e910100002130083301c374c00297ae014c0103d87a8000133006006003375660320066eb8c05c008c06c008c0640052825114a02a666022600c60246ea80305288992999809180598099baa00114a02a6660246660246464660020026eb0c064c068c068c068c068c068c068c068c068c058dd500891299980c0008a5013253330163371e6eb8c06c008010528899801801800980d8009bae301730143754002941288a5014a266646002002444a66602e0042980103d87a8000132325333016300b003130063301a375200497ae01333005005001337000069000980d8019bae30190023758600860266ea8014dd6980b18099baa00c374a900019b8948000dd6980098089baa003230143015001230130013011300e37540042c6e1d2000300f3010002300e001300a37540046e1d200216300b300c002300a001300a00230080013004375400229309b2b2b9a5573aaae7955cfaba05742ae89"; 
      const validator: SpendingValidator = {
        type: "PlutusV3",  
        script: validatorScript,
      };

      const contractAddress = validatorToAddress("Mainnet", validator);
      console.log("Contract Address:", contractAddress);

      const api = await window.cardano[enabledWallet].enable();
      lucid.selectWallet.fromAPI(api);

      const walletAddress = await lucid.wallet().address();
      console.log("Connected Wallet Address:", walletAddress);
   


    // Convert addresses to participants without the extra "581c" prefix
    const isParticipants = async (addresses: string[]) => {
      return await Promise.all(
        addresses.map(async (address) => {
          const publicKeyHash = await getPublicKeyHash(address);
          if (publicKeyHash) {
            // Convert Uint8Array directly to hex string without Data.Bytes wrapper
            return toHex(publicKeyHash); 
          }
          return null;
        })
      ).then((result) => result.filter((hash): hash is string => hash !== null));
    };

  const getAddresses = [
    "addr_test1qzum0v4sa322zjrcq7jk3nfa6y4dnrt5et2aj5qzvqq850a69k57jq3463zjg4w7glleaa9n5c39wjgu98dlyhq6es0q9uefxq",
  ];

  const participantsHex = await isParticipants(getAddresses); 

  // Construct the datum using the hex strings
  const currentRound = BigInt(1n);
  const datum = Data.to(new Constr(0, [participantsHex, currentRound]));

  console.log("Participants Hex:", participantsHex);
  console.log("Serialized Datum:", datum);
  console.log("Participants Hex (as JSON):", JSON.stringify(participantsHex, null, 2));
  console.log("Serialized Datum (as JSON):", JSON.stringify(datum, null, 2));

  const utxos = await lucid.wallet().getUtxos();

  // Convert ADA to Lovelace safely
  const amountInLovelace = Number(amountInAda) * 1_000_000;
    if (!amountInLovelace || isNaN(amountInLovelace)) {
      throw new Error("Invalid ADA amount.");
  }

  const tx = await lucid.newTx()
  .pay.ToAddressWithData(contractAddress, { kind: "inline", value: datum }, { lovelace: BigInt(amountInLovelace) })
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
    setIsLoading(false);  
  }
};



const handleRedeem = async () => {
  if (!enabledWallet) {
    setErrorMessage("Wallet not connected.");
    return;
  }

  setIsLoading(true);
  setTxHash(null);
  setRedeemTxHash(null);
  setErrorMessage(null);
  setNotificationMessage(null);

  try {
    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET;
    const api = await window.cardano[enabledWallet].enable();
    const lucid = await Lucid(
      new Blockfrost(`https://cardano-${networkEnv.toLowerCase()}.blockfrost.io/api/v0`, blockfrostApiKey),
      "Mainnet"
    );
    lucid.selectWallet.fromAPI(api);

    const validatorScript = "5904e0010100323232323232322533300232323232325332330083001300937540042646464646464a66601c60060022a66602260206ea8024540085854ccc038c01c0044c8c94ccc04cc0580085401058dd6980a00098081baa00916300e37540102a6660186002601a6ea80084c8c8c8c94c8ccc044ccc044c94ccc048ccc0494ccc0540045288a504a09444ccc048cdd799199800800801260105d8799fa0ff00222533301800210011333003003301b00232325333017301030183754006298103d87a8000132533301853330183330183370e004901c2504a229444c8cc004004008894ccc07400452809919299980e19b9100700113371e00e0022660080080046eb8c070c080008c0800045300103d87a8000130083301c374c646600200200444a66603a00226603c66ec0dd480299980d2514c103d87a80004c0103d87980004bd6f7b630099191919299980f19b90009002133022337606ea4024ccc07928a6103d87a80004c0103d87980000051533301e3371e01200426604466ec0dd480499980f2514c0103d87a80004c0103d8798000003133022337606ea4008ccc078005300103d87a80004c0103d8798000330060060033016301e3754603e0066eb8c074008c084008c07c0052f5c06eacc070c064dd50019b8d001375c6034004980103d87a80004a09445281bac30043013375400a941288a50153330113330110024a09445280a999808999808991919299980a1804980a9baa001153330143370e00460066eacc018c058dd5180c980b1baa00114a2294052819299980b8008a6103d87a8000130043301830190014bd701bac301830193019301537540206466600200264660020026eb0c01cc058dd500891299980c0008a5eb804c8c94ccc05ccdd79805180c9baa00200e13301b00233004004001133004004001301c002301a001480008894ccc06000840044ccc00c00cc06c008cdc000098021bab300730173754600e602e6ea8c0680088c94ccc04cc030c050dd50008a400026eb4c060c054dd50009929998099806180a1baa00114c0103d87a80001323300100137566032602c6ea8008894ccc060004530103d87a800013232323253330193372291100002153330193371e910100002130093301d375000297ae014c0103d87a8000133006006003375a60340066eb8c060008c070008c068004c8cc004004008894ccc05c0045300103d87a800013232323253330183372291100002153330183371e910100002130083301c374c00297ae014c0103d87a8000133006006003375660320066eb8c05c008c06c008c0640052825114a02a666022600c60246ea80305288992999809180598099baa00114a02a6660246660246464660020026eb0c064c068c068c068c068c068c068c068c068c058dd500891299980c0008a5013253330163371e6eb8c06c008010528899801801800980d8009bae301730143754002941288a5014a266646002002444a66602e0042980103d87a8000132325333016300b003130063301a375200497ae01333005005001337000069000980d8019bae30190023758600860266ea8014dd6980b18099baa00c374a900019b8948000dd6980098089baa003230143015001230130013011300e37540042c6e1d2000300f3010002300e001300a37540046e1d200216300b300c002300a001300a00230080013004375400229309b2b2b9a5573aaae7955cfaba05742ae89";
    const validator: SpendingValidator = {
      type: "PlutusV3",
      script: validatorScript,
    };
    const contractAddress = validatorToAddress("Mainnet", validator);
    console.log("Contract Address:", contractAddress);

    const walletAddress = await lucid.wallet().address();
    const publicKeyHashBytes: Uint8Array | null = await getPublicKeyHash(walletAddress);
    const publicKeyHash = publicKeyHashBytes ? toHex(publicKeyHashBytes) : null;

    if (!publicKeyHash) {
      setErrorMessage("Failed to fetch the public key hash.");
      return;
    }

    // Fetch UTXOs from the contract
    const allUTxOs = await lucid.utxosAt(contractAddress);
    console.log("Fetched Contract UTXOs:", allUTxOs);

    const winnerUTxOs = allUTxOs.filter((utxo) => {
    if (!utxo.datum) return false;

    const datum = Data.from(utxo.datum);

    // we check if datum is of type Constr<Data> before accessing index and fields
    if (datum instanceof Constr && datum.index === 0) {
        const participants = datum.fields[0] as string[];
        console.log("Participants:", participants);
        return participants.includes(publicKeyHash);
    }

    console.error("Invalid datum type:", datum);
    return false;
    });

    if (winnerUTxOs.length === 0) {
    setErrorMessage("No UTXO found for the winner.");
    return;
    }

    console.log("Selected Winner UTXOs:", winnerUTxOs);


    // Construct the redeemer
    const winnerIndex = 0n;
    const redeemRedeemer = Data.to(new Constr(1, [BigInt(winnerIndex)]));
    console.log("Redeemer constructed:", redeemRedeemer);

    // Convert addresses to participants without the extra "581c" prefix
    const isParticipants = async (addresses: string[]) => {
      return await Promise.all(
        addresses.map(async (address) => {
          const publicKeyHash = await getPublicKeyHash(address);
          if (publicKeyHash) {
            // Convert Uint8Array directly to hex string without Data.Bytes wrapper
            return toHex(publicKeyHash); 
          }
          return null;
        })
      ).then((result) => result.filter((hash): hash is string => hash !== null));
    };

  const getAddresses = [
    "addr_test1qzum0v4sa322zjrcq7jk3nfa6y4dnrt5et2aj5qzvqq850a69k57jq3463zjg4w7glleaa9n5c39wjgu98dlyhq6es0q9uefxq",
  ];

  const participantsHex = await isParticipants(getAddresses); 

  // Construct the datum using the hex strings
  const currentRound = BigInt(1n);
  const datum = Data.to(new Constr(0, [participantsHex, currentRound]));

  console.log("Participants Hex:", participantsHex);
  console.log("Serialized Datum:", datum);
  console.log("Participants Hex (as JSON):", JSON.stringify(participantsHex, null, 2));
  console.log("Serialized Datum (as JSON):", JSON.stringify(datum, null, 2));

    // Build the transaction
    console.log("Building the transaction...");
    const tx = await lucid.newTx()
    .collectFrom(allUTxOs, redeemRedeemer) // Use all UTxO
    .pay.ToAddress(await lucid.wallet().address(), { lovelace: BigInt(2_000_000) })
    .attach.SpendingValidator(validator)
    .addSigner(walletAddress)
    .complete({ localUPLCEval: false });
    console.log("Transaction constructed successfully:", tx);

    // Sign and submit the transaction
    const signedTx = await tx.sign.withWallet().complete();
    console.log("Transaction signed successfully:", signedTx);
    const redeemTxHash = await signedTx.submit();
    console.log("Transaction submitted:", redeemTxHash);

    setRedeemTxHash(redeemTxHash);
  } catch (error) {
    console.error("Error in handleRedeem:", error);
    handleReadableError(error);
  } finally {
    setIsLoading(false);
  }
};



// Function to handle errors with user-friendly messages
const handleReadableError = (error: any) => {
  let userMessage = "An unexpected issue occurred.";
  if (typeof error === 'string') {
    if (error.includes("end of input bytes")) {
      userMessage = "Failed to parse the datum.";
    }
  } else if (error instanceof Error) {
    if (error.message.includes("EMPTY_UTXO")) {
      userMessage = "No funds found to redeem.";
    } else if (error.message.includes("INSUFFICIENT_FUNDS")) {
      userMessage = "Insufficient funds in your wallet.";
    } else if (error.message.includes("NETWORK_ERROR")) {
      userMessage = "Network error. Please check your connection.";
    } else {
      userMessage = error.message;
    }
  }
  setErrorMessage(userMessage);
  console.error("Error:", userMessage);
};


return (
  <div className="w-full max-w-md mx-auto p-6 bg-white rounded shadow-lg mt-10">
    <h2 className="text-2xl font-semibold mb-6 text-center">Contribute to the establishment of the tontine</h2>
    <div className="mb-4">
      <input
        type="number"
        placeholder="ada"
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
        {isLoading ? "Processing..." : "Contribute Fund"}
      </button>
    </div>
    <div className="mb-4">
      <button
        className={`w-full p-3 text-white font-semibold rounded ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
        onClick={handleRedeem}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Collect Fund"}
      </button>
    </div>
    {txHash && (
      <p className="text-green-500 text-center mt-2">
        Transaction submitted! Check it on{" "}
        <a
          href={`https://cardanoscan.io/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Cardano Explorer
        </a>
        .
      </p>
    )}

    
    {redeemTxHash && (
      <p className="text-green-500 text-center mt-2">
        Redeem Transaction submitted! Check it on{" "}
        <a
          href={`https://cardanoscan.io/transaction/${redeemTxHash}`}
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
      <p className="text-gray-500 text-center mt-2">Error: {errorMessage}</p>
    )}
  </div>
);
};

export default dynamic(() => Promise.resolve(CheckRedeem), { ssr: false });
