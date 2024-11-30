"use client";

import { Lucid, Blockfrost, paymentCredentialOf, SpendingValidator, validatorToAddress, getAddressDetails, Data, Credential, Constr, toHex, fromHex, UTxO} from "@lucid-evolution/lucid";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import React, { useState } from "react";
import dynamic from "next/dynamic";



/**
 * Converts a Bech32 address to a public key hash (Uint8Array).
 * Uses the getAddressCredential function.
 */
const getPublicKeyHashFromAddress = async (address: string): Promise<Uint8Array | null> => {
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


const Contribute = () => {
  const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV === "Preprod"
    ? NetworkType.TESTNET
    : NetworkType.MAINNET;

  const { isConnected, enabledWallet } = useCardano({
    limitNetwork: networkEnv,
  });

  const [amountInAda, setAmountInAda] = useState<number | string>("");  
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [redeemTxHash, setRedeemTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<bigint>(1n); // Initialize round number as bigint
  const handleContribute = async () => {
    if (!isConnected || !enabledWallet || !amountInAda || isNaN(Number(amountInAda))) {
      setErrorMessage("Invalid input or wallet not connected.");
      return;
    }

    setIsLoading(true);
    setTxHash(null); 
    setErrorMessage(null);

    try {
      const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD || process.env.NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET || "";
      const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV === "Preprod" ? "Preprod" : "Mainnet"; 
      
      // Initialize Lucid
      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${networkEnv.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostApiKey
        ),
        networkEnv
      );

      const validatorScript = "5906ea010100323232323232323232322533300332323232325332330093001300b37540042646464a66666602800c2646464a66601e60060022a66602660246ea80245400803854ccc03cc01c0044c94ccc05000403c4c94cccccc0640040400400404c94ccc058c06400c54014044dd6800808180b00098091baa00900e301037540102a66601a6002601e6ea80084c8c8c8c94c8ccc048ccc048c94ccc04cccc04d4ccc05c0045288a504a09444ccc04ccdd799199800800801260105d8799fa0ff00222533301a00210011333003003301d002323253330183010301a3754006298103d87a8000132533301953330193330193370e004901c2504a229444c8cc004004008894ccc07c00452809919299980e99b9100700113371e00e0022660080080046eb8c078c088008c0880045300103d87a8000130083301e374c646600200200444a66603e00226604066ec0dd480299980da514c103d87a80004c0103d87980004bd6f7b630099191919299980f99b90009002133024337606ea4024ccc07d28a6103d87a80004c0103d87980000051533301f3371e01200426604866ec0dd480499980fa514c0103d87a80004c0103d8798000003133024337606ea4008ccc07c005300103d87a80004c0103d87980003300600600330163020375460420066eb8c07c008c08c008c0840052f5c06eacc078c06cdd50019b8d001375c6038004980103d87a80004a09445281bac30043015375400a941288a99809a481284552524f523a20496e76616c6964207061727469636970616e74206b65792064657465637465642e0014a02a666024666024004941288a99809a491f4552524f523a20526f756e64206e756d62657220697320696e76616c69642e0014a02a666024666024646464a66602a6012602e6ea800454ccc054cdc380118019bab300630183754603660306ea80045288a9980b2481394552524f523a20546f74616c206c6f76656c616365206d69736d61746368206265747765656e20696e7075747320616e64206f75747075742e0014a02a6602c9212a4552524f523a204e6f206f757470757420666f756e6420696e20746865207472616e73616374696f6e2e0014a064a666032002298103d87a8000130043301a301b0014bd701bac301a301b301b301737540206466600200264660020026eb0c01cc060dd500891299980d0008a5eb804c8c94ccc060cdd79805180d9baa00200e13301d00233004004001133004004001301e002301c001480008894ccc06800840044ccc00c00cc074008cdc000098021bab300730193754600e60326ea8c0700088c94ccc050c030c058dd50008a400026eb4c068c05cdd500099299980a1806180b1baa00114c0103d87a8000132330010013756603660306ea8008894ccc068004530103d87a8000132323232533301a33722911000021533301a3371e910100002130093301f375000297ae014c0103d87a8000133006006003375a60380066eb8c068008c078008c070004c8cc004004008894ccc0640045300103d87a800013232323253330193372291100002153330193371e910100002130083301e374c00297ae014c0103d87a8000133006006003375660360066eb8c064008c074008c06c0052825114a02a666024600c60286ea803054cc04d24124436f6e747269627574696f6e2076616c696461746564207375636365737366756c6c792e0014a2264a6660266016602a6ea800454cc05124011c4552524f523a20496e76616c69642077696e6e657220696e6465782e0014a02a6660266660266464660020026eb0c06cc070c070c070c070c070c070c070c070c060dd500891299980d0008a5013253330173371e6eb8c074008010528899801801800980e8009bae301930163754002941288a9980a2481274552524f523a204d697373696e67207369676e6174757265206f66207468652077696e6e65722e0014a02a660289211057696e6e65722076657269666965642e0014a266646002002444a666032004298103d87a8000132325333017300b003130063301c375200497ae01333005005001337000069000980e8019bae301b00237586008602a6ea8014dd6980c180a9baa00c374a900019b8948000dd6980098099baa003230163017001230150013013301037540042a6601c921154552524f523a204d697373696e6720446174756d2e0016370e900000580580580598089809001180800098061baa002370e90010a99804a4811f4552524f523a20496e76616c69642076616c696461746f722075736167652e0016300d300e002300c001300c002300a001300637540022930a998022491856616c696461746f722072657475726e65642066616c73650013656153300249011972656465656d65723a20546f6e74696e6552656465656d657200165734ae7155ceaab9e5573eae815d0aba257481"; 
      const validator: SpendingValidator = {
        type: "PlutusV3",  
        script: validatorScript,
      };

      const contractAddress = validatorToAddress(networkEnv, validator);
      console.log("Contract Address:", contractAddress);

      const api = await window.cardano[enabledWallet].enable();
      lucid.selectWallet.fromAPI(api);

      const walletAddress = await lucid.wallet().address();
      console.log("Connected Wallet Address:", walletAddress);
   


    // Convert addresses to participants without the extra "581c" prefix
    const convertAddressesToParticipants = async (addresses: string[]) => {
      return await Promise.all(
        addresses.map(async (address) => {
          const publicKeyHash = await getPublicKeyHashFromAddress(address);
          if (publicKeyHash) {
            // Convert Uint8Array directly to hex string without Data.Bytes wrapper
            return toHex(publicKeyHash); 
          }
          return null;
        })
      ).then((result) => result.filter((hash): hash is string => hash !== null));
    };

  const hardCodedAddresses = ["addr_test1qzxm3w8cr2t0da7r6jh5n0h4c49mur07xkjq3l2wu6xhguu0x7zxuq8e6wnvmx67tmkpr7de0guxez98c2knvpmnwmnq4ws9qt",
                              "addr_test1qr3vvne9wyjqpnut2j3xaw47x7cqjgfcqpj468xddqng7pv7hpeqvvj26jpvszt4xldx6jrtksnaunwcq96a7zr3ndtsz43mua",
                              "addr_test1qzum0v4sa322zjrcq7jk3nfa6y4dnrt5et2aj5qzvqq850a69k57jq3463zjg4w7glleaa9n5c39wjgu98dlyhq6es0q9uefxq"
  ];

  const participantsHex = await convertAddressesToParticipants(hardCodedAddresses); 

  // Construct the datum using the hex strings
  const currentRoundNumber = BigInt(1n);
  const datum = Data.to(new Constr(0, [participantsHex, currentRoundNumber]));

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
  if (!enabledWallet || isNaN(Number(amountInAda))) {
    setErrorMessage("Invalid input or wallet not connected.");
    return;
  }

  setIsLoading(true);
  setTxHash(null);
  setErrorMessage(null);
  setNotificationMessage(null);

  try {
    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD;
    const api = await window.cardano[enabledWallet].enable();
    const lucid = await Lucid(
      new Blockfrost(`https://cardano-preprod.blockfrost.io/api/v0`, blockfrostApiKey),
      "Preprod"
    );
    lucid.selectWallet.fromAPI(api);

    
     // For the "Contribute" redeemer
     const contributeRedeemer = Data.to(new Constr(0, []));
     console.log("Contribute Redeemer:", contributeRedeemer);
 
     // For the "Redeem" redeemer with a winner index of 0
     const winnerIndex = BigInt(0n);
     const redeemRedeemer = Data.to(new Constr(1, [BigInt(winnerIndex)]));
     console.log("Redeemer for Redeem Action:", redeemRedeemer);
     console.log("Serialized RedeemRedeemer (as JSON):", JSON.stringify(redeemRedeemer, null, 2));
     console.log("Serialized ContributeRedeemer (as JSON):", JSON.stringify(contributeRedeemer, null, 2));



     // Get and add current participant
     const hardCodedAddresses = 
       [    "addr_test1qzxm3w8cr2t0da7r6jh5n0h4c49mur07xkjq3l2wu6xhguu0x7zxuq8e6wnvmx67tmkpr7de0guxez98c2knvpmnwmnq4ws9qt",
            "addr_test1qr3vvne9wyjqpnut2j3xaw47x7cqjgfcqpj468xddqng7pv7hpeqvvj26jpvszt4xldx6jrtksnaunwcq96a7zr3ndtsz43mua",
            "addr_test1qzum0v4sa322zjrcq7jk3nfa6y4dnrt5et2aj5qzvqq850a69k57jq3463zjg4w7glleaa9n5c39wjgu98dlyhq6es0q9uefxq"
       ];

       // Convert addresses to participants without the extra "581c" prefix
      const convertAddressesToParticipants = async (addresses: string[]) => {
        return await Promise.all(
          addresses.map(async (address) => {
            const publicKeyHash = await getPublicKeyHashFromAddress(address);
            if (publicKeyHash) {
              // Convert Uint8Array directly to hex string without Data.Bytes wrapper
              return toHex(publicKeyHash); 
            }
            return null;
          })
        ).then((result) => result.filter((hash): hash is string => hash !== null));
      };

      const participantsHex = await convertAddressesToParticipants(hardCodedAddresses); 

      // Construct the datum using the hex strings
      const currentRoundNumber = BigInt(1n);
      const datum = Data.to(new Constr(0, [participantsHex, currentRoundNumber]));

      console.log("Participants Hex:", participantsHex);
      console.log("Serialized Datum:", datum);
      console.log("Participants Hex (as JSON):", JSON.stringify(participantsHex, null, 2));
      console.log("Serialized Datum (as JSON):", JSON.stringify(datum, null, 2));

      const utxos = await lucid.wallet().getUtxos();


    const validatorScript = "5906ea010100323232323232323232322533300332323232325332330093001300b37540042646464a66666602800c2646464a66601e60060022a66602660246ea80245400803854ccc03cc01c0044c94ccc05000403c4c94cccccc0640040400400404c94ccc058c06400c54014044dd6800808180b00098091baa00900e301037540102a66601a6002601e6ea80084c8c8c8c94c8ccc048ccc048c94ccc04cccc04d4ccc05c0045288a504a09444ccc04ccdd799199800800801260105d8799fa0ff00222533301a00210011333003003301d002323253330183010301a3754006298103d87a8000132533301953330193330193370e004901c2504a229444c8cc004004008894ccc07c00452809919299980e99b9100700113371e00e0022660080080046eb8c078c088008c0880045300103d87a8000130083301e374c646600200200444a66603e00226604066ec0dd480299980da514c103d87a80004c0103d87980004bd6f7b630099191919299980f99b90009002133024337606ea4024ccc07d28a6103d87a80004c0103d87980000051533301f3371e01200426604866ec0dd480499980fa514c0103d87a80004c0103d8798000003133024337606ea4008ccc07c005300103d87a80004c0103d87980003300600600330163020375460420066eb8c07c008c08c008c0840052f5c06eacc078c06cdd50019b8d001375c6038004980103d87a80004a09445281bac30043015375400a941288a99809a481284552524f523a20496e76616c6964207061727469636970616e74206b65792064657465637465642e0014a02a666024666024004941288a99809a491f4552524f523a20526f756e64206e756d62657220697320696e76616c69642e0014a02a666024666024646464a66602a6012602e6ea800454ccc054cdc380118019bab300630183754603660306ea80045288a9980b2481394552524f523a20546f74616c206c6f76656c616365206d69736d61746368206265747765656e20696e7075747320616e64206f75747075742e0014a02a6602c9212a4552524f523a204e6f206f757470757420666f756e6420696e20746865207472616e73616374696f6e2e0014a064a666032002298103d87a8000130043301a301b0014bd701bac301a301b301b301737540206466600200264660020026eb0c01cc060dd500891299980d0008a5eb804c8c94ccc060cdd79805180d9baa00200e13301d00233004004001133004004001301e002301c001480008894ccc06800840044ccc00c00cc074008cdc000098021bab300730193754600e60326ea8c0700088c94ccc050c030c058dd50008a400026eb4c068c05cdd500099299980a1806180b1baa00114c0103d87a8000132330010013756603660306ea8008894ccc068004530103d87a8000132323232533301a33722911000021533301a3371e910100002130093301f375000297ae014c0103d87a8000133006006003375a60380066eb8c068008c078008c070004c8cc004004008894ccc0640045300103d87a800013232323253330193372291100002153330193371e910100002130083301e374c00297ae014c0103d87a8000133006006003375660360066eb8c064008c074008c06c0052825114a02a666024600c60286ea803054cc04d24124436f6e747269627574696f6e2076616c696461746564207375636365737366756c6c792e0014a2264a6660266016602a6ea800454cc05124011c4552524f523a20496e76616c69642077696e6e657220696e6465782e0014a02a6660266660266464660020026eb0c06cc070c070c070c070c070c070c070c070c060dd500891299980d0008a5013253330173371e6eb8c074008010528899801801800980e8009bae301930163754002941288a9980a2481274552524f523a204d697373696e67207369676e6174757265206f66207468652077696e6e65722e0014a02a660289211057696e6e65722076657269666965642e0014a266646002002444a666032004298103d87a8000132325333017300b003130063301c375200497ae01333005005001337000069000980e8019bae301b00237586008602a6ea8014dd6980c180a9baa00c374a900019b8948000dd6980098099baa003230163017001230150013013301037540042a6601c921154552524f523a204d697373696e6720446174756d2e0016370e900000580580580598089809001180800098061baa002370e90010a99804a4811f4552524f523a20496e76616c69642076616c696461746f722075736167652e0016300d300e002300c001300c002300a001300637540022930a998022491856616c696461746f722072657475726e65642066616c73650013656153300249011972656465656d65723a20546f6e74696e6552656465656d657200165734ae7155ceaab9e5573eae815d0aba257481"; 
    const validator: SpendingValidator = {
        type: "PlutusV3",
        script: validatorScript,
      };    

    const contractAddress = validatorToAddress("Preprod", validator);
    console.log("contractAddress:" , contractAddress)
    
    const allUtxos = await lucid.utxosAt(contractAddress);
    console.log("allUtxos:" , allUtxos); 

    // Fetch UTXOs and filter for correctly formatted ones
    async function getWinnerUtxo() {
        const utxos = await lucid.utxosAt(contractAddress);
        console.log("All Contract UTXOs:", utxos);
    
        // Find the UTXO with the correct datum
        const winnerUtxo = await findWinnerUtxo(utxos);
    
        if (!winnerUtxo) {
        throw new Error("No UTXO found for the winner.");
        }
    
        console.log("Winner UTXO found:", winnerUtxo);
        return winnerUtxo;
    }
    
    // Helper function to find UTXO with the correct datum
    async function findWinnerUtxo(utxos: UTxO[]) {
        for (const utxo of utxos) {
          if (!utxo.datumHash) {
            console.log("No datumHash for UTXO:", utxo.txHash);
            continue;
          }
      
          try {
            // Fetch the datum if not already present
            const datum = utxo.datum ?? await lucid.datumOf(utxo);
      
            if (!datum) {
              console.error("Failed to fetch datum for UTXO:", utxo.txHash);
              continue;
            }
      
            console.log("Fetched Datum:", datum);
      
            // Convert datum to a Constr<Data> if possible
            const parsedDatum = typeof datum === 'string' ? Data.from(datum) : datum;
      
            // Check if parsedDatum is of type Constr<Data>
            if (parsedDatum instanceof Constr) {
              console.log("Parsed Datum Fields:", parsedDatum.fields);
              console.log("Parsed Datum Index:", parsedDatum.index);
      
              // Check if the parsed datum has the correct index
              if (parsedDatum.index === 0) { // Adjust this index as needed
                return utxo;
              }
            } else {
              console.error("Parsed datum is not a Constr<Data>:", parsedDatum);
            }
          } catch (error) {
            console.error("Error deserializing datum for UTXO:", utxo.txHash, error);
          }
        }
      
        return null;
      }
    
    // Testing the getWinnerUtxo function
    (async () => {
        try {
        const winnerUtxo = await getWinnerUtxo();
        if (winnerUtxo) {
            console.log("Found Winner UTXO:", winnerUtxo);
        } else {
            console.log("No winner UTXO found.");
        }
        } catch (error) {
        console.error("Error fetching winner UTXO:", error);
        }
    })();
      
    const tx = await lucid.newTx()
    .collectFrom(allUtxos, redeemRedeemer)
    //.pay.ToAddressWithData(contractAddress, { kind: "inline", value: datum }, { lovelace: BigInt(13_000_000n) })
    .pay.ToAddress(await lucid.wallet().address(), { lovelace: BigInt(17_000_000n) })
    .addSigner(await lucid.wallet().address())
    .attach.SpendingValidator(validator)
    .complete({localUPLCEval: false});

    const signedTx = await tx.sign.withWallet().complete();
    const redeemTxHash = await signedTx.submit();
    setRedeemTxHash(redeemTxHash);

    setTxHash(txHash);
    setCurrentRoundNumber((prev) => prev + 1n);
  } catch (error) {
    // console.error("Error in redemption transaction:", error);
    // setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
    handleReadableError(error);
  } finally {
    setIsLoading(false);
  }
};

// Function to handle errors with user-friendly messages
const handleReadableError = (error: any) => {
  let userMessage = "An unexpected issue occurred. Please try again.";
  
  // Check for InfoMessage class and handle it differently
  if (error instanceof InfoMessage) {
    if (error.message === "NO_UTXO_FOUND") {
      setNotificationMessage(
        "No transaction outputs available. If you've recently made a transaction, please wait for the blockchain to sync."
      );
      return;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("EMPTY_UTXO")) {
      userMessage = "No funds found to redeem. Please ensure you have available UTxOs.";
    } else if (error.message.includes("INSUFFICIENT_FUNDS")) {
      userMessage = "Insufficient funds in your wallet.";
    } else if (error.message.includes("NETWORK_ERROR")) {
      userMessage = "Network error. Please check your connection.";
    } else {
      userMessage = error.message;
    }
  }

  console.error("Error:", error.message);
    setErrorMessage(userMessage);
  };

  class InfoMessage extends Error {
    constructor(message: string) {
      super(message);
      this.name = "InfoMessage";
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
    <div className="mb-4">
      <button
        className={`w-full p-3 text-white font-semibold rounded ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
        onClick={handleRedeem}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Retirer"}
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

    
    {redeemTxHash && (
      <p className="text-green-500 text-center mt-2">
        Redeem Transaction submitted! Check it on{" "}
        <a
          href={`https://preprod.cardanoscan.io/transaction/${redeemTxHash}`}
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
      <p className="text-red-500 text-center mt-2">Error: {errorMessage}</p>
    )}
  </div>
);
};

export default dynamic(() => Promise.resolve(Contribute), { ssr: false });
