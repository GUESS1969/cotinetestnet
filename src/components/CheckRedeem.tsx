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

      const validatorScript = "5909c5010100323232323232323232322533300332323232325332330093001300b37540042646464a66666602800c2646464a66601e60060022a66602660246ea80245400803854ccc03cc01c0044c94ccc05000403c4c94cccccc0640040400400404c94ccc058c06400c54014044dd6800808180b00098091baa00900e301037540102a66601a6002601e6ea80084c8c8c8c94c8ccc048ccc048c94ccc04cccc04d4ccc05c0045288a504a09444ccc04ccdd799199800800801260105d8799fa0ff00222533301a00210011333003003301d002325333017300f30193754004298103d87a8000132533301853330183330183370e6e3400920384a09445288991980080080111299980f0008a5013232533301c3372200c002266e3c0180044cc010010008dd7180e981080118108008a6103d87a8000130073301d374c646600200200444a66603c00226603e66ec0dd480219980d2514c103d87a80004c0103d87980004bd6f7b630099191919299980f19b90008002133023337606ea4020ccc07928a6103d87a80004c0103d87980000051533301e3371e01000426604666ec0dd480419980f2514c0103d87a80004c0103d8798000003133023337606ea4008ccc078005300103d87a80004c0103d8798000330060060033015301f375460400066eb8c078008c088008c0800052f5c06eacc074c068dd50011bae301c0024c103d87a80004a09445281bac30043015375400a941288a99809a481284552524f523a20496e76616c6964207061727469636970616e74206b65792064657465637465642e0014a02a666024666024004941288a99809a491f4552524f523a20526f756e64206e756d62657220697320696e76616c69642e0014a02a64666026666026646464646464646464a6603a920114746f74616c5f696e7075745f6c6f76656c61636500153301d30023750002264a66603a6022603e6ea80044c94cc07d24011677696e6e65725f6f75747075745f6c6f76656c61636500153301f300437500022a66603c66e1c00c0045288a9980fa49394552524f523a20546f74616c206c6f76656c616365206d69736d61746368206265747765656e20696e7075747320616e64206f75747075742e0014a060086eacc038c080dd5181198101baa001153301e49141494e464f3a204e6f2066756e647320617661696c61626c6520696e2074686520636f6e74726163742e20506c656173652074727920616761696e206c617465722e0014a064a666042002298103d87a80001300c3302230230014bd701bac302230233023301f37540306466600200264660020026eb0c03cc080dd500c9129998110008a5eb804c8c94ccc080cdd7980918119baa0020161330250023300400400113300400400130260023024001480008894ccc08800840044ccc00c00cc094008cdc000098029bab300f30213754601e60426ea8c0900088dcc99801800a44100232533301b3013301d37540022900009bad3021301e375400264a6660366026603a6ea8004530103d87a80001323300100137566044603e6ea8008894ccc084004530103d87a800013232323253330213372291100002153330213371e9101000021301033026375000297ae014c0103d87a8000133006006003375a60460066eb8c084008c094008c08c004c8cc004004008894ccc0800045300103d87a800013232323253330203372291100002153330203371e9101000021300f33025374c00297ae014c0103d87a8000133006006003375660440066eb8c080008c090008c088004c0040048894ccc8cccc08c00c4c8c8c8c8c8c8cc030008004cdc5245012800002533301f337100069007099b80483c80400c54ccc07ccdc4001a410004266e00cdc0241002800690068b2999811000899b8a4881035b5d2900005133714911035b5f2000333300800133714911025d290000522333009009002300600122333009009002001375860400046eb4c078004c8cdd81ba8301e001374e603e0026ea800c4c94ccc0800044cdc52441027b7d00003133714911037b5f200032323300100100322533302300110031533302330260011323330090093022001337149101023a2000333009009302300100430250011323330090093022001337149101023a20003330090093023001300633003003302700230250013371491102207d000033756006264a666040002266e29221025b5d00003133714911035b5f2000333300600133714911015d000032233300700700230040012233300700700200137580066e292201022c2000133005375a0040022646466e2922010268270000132333001001300a371a00466e292201012700003222533301e33710004900008008991919199803003180780299b8b33700004a66604266e2000920141481805206e3371666e000054ccc084cdc4000a4028290300a40dc00866e18009202033706002901019b8e004002375c0044444646600200200a44a666040002200a2a6660406046002266006604400200a266008604400266004004604600244646600200200644a666032601a002266e29220101300000315333019337100029000099b8a489012d003300200233702900000089980299b8400148050cdc599b803370a002900a240c00066002002444a66602c66e2400920001001133300300333708004900a19b8b3370066e140092014481800052825114a02a666026600e602a6ea8034528899299980a1806180b1baa001153301549011c4552524f523a20496e76616c69642077696e6e657220696e6465782e0014a02a6660286660286464660020026eb0c070c074c074c074c074c074c074c074c074c064dd500911299980d8008a5013253330183371e6eb8c078008010528899801801800980f0009bae301a30173754002941288a9980aa481274552524f523a204d697373696e67207369676e6174757265206f66207468652077696e6e65722e0014a02a6602a9211057696e6e65722076657269666965642e0014a266646002002444a666034004298103d87a8000132325333018300c003130073301d375200497ae013330050050013006003301e003375c60380046eb0c014c058dd50031bad30193016375401a6e012001374a900019b8948000dd6980098099baa003230163017001230150013013301037540042a6601c9201154552524f523a204d697373696e6720446174756d2e0016370e900000580580580598089809001180800098061baa002370e90010a99804a4811f4552524f523a20496e76616c69642076616c696461746f722075736167652e0016300d300e002300c001300c002300a001300637540022930a998022491856616c696461746f722072657475726e65642066616c73650013656153300249011972656465656d65723a20546f6e74696e6552656465656d657200165734ae7155ceaab9e5573eae815d0aba257481"; 
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
    "addr_test1qr3vvne9wyjqpnut2j3xaw47x7cqjgfcqpj468xddqng7pv7hpeqvvj26jpvszt4xldx6jrtksnaunwcq96a7zr3ndtsz43mua"
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

    const validatorScript = "5909c5010100323232323232323232322533300332323232325332330093001300b37540042646464a66666602800c2646464a66601e60060022a66602660246ea80245400803854ccc03cc01c0044c94ccc05000403c4c94cccccc0640040400400404c94ccc058c06400c54014044dd6800808180b00098091baa00900e301037540102a66601a6002601e6ea80084c8c8c8c94c8ccc048ccc048c94ccc04cccc04d4ccc05c0045288a504a09444ccc04ccdd799199800800801260105d8799fa0ff00222533301a00210011333003003301d002325333017300f30193754004298103d87a8000132533301853330183330183370e6e3400920384a09445288991980080080111299980f0008a5013232533301c3372200c002266e3c0180044cc010010008dd7180e981080118108008a6103d87a8000130073301d374c646600200200444a66603c00226603e66ec0dd480219980d2514c103d87a80004c0103d87980004bd6f7b630099191919299980f19b90008002133023337606ea4020ccc07928a6103d87a80004c0103d87980000051533301e3371e01000426604666ec0dd480419980f2514c0103d87a80004c0103d8798000003133023337606ea4008ccc078005300103d87a80004c0103d8798000330060060033015301f375460400066eb8c078008c088008c0800052f5c06eacc074c068dd50011bae301c0024c103d87a80004a09445281bac30043015375400a941288a99809a481284552524f523a20496e76616c6964207061727469636970616e74206b65792064657465637465642e0014a02a666024666024004941288a99809a491f4552524f523a20526f756e64206e756d62657220697320696e76616c69642e0014a02a64666026666026646464646464646464a6603a920114746f74616c5f696e7075745f6c6f76656c61636500153301d30023750002264a66603a6022603e6ea80044c94cc07d24011677696e6e65725f6f75747075745f6c6f76656c61636500153301f300437500022a66603c66e1c00c0045288a9980fa49394552524f523a20546f74616c206c6f76656c616365206d69736d61746368206265747765656e20696e7075747320616e64206f75747075742e0014a060086eacc038c080dd5181198101baa001153301e49141494e464f3a204e6f2066756e647320617661696c61626c6520696e2074686520636f6e74726163742e20506c656173652074727920616761696e206c617465722e0014a064a666042002298103d87a80001300c3302230230014bd701bac302230233023301f37540306466600200264660020026eb0c03cc080dd500c9129998110008a5eb804c8c94ccc080cdd7980918119baa0020161330250023300400400113300400400130260023024001480008894ccc08800840044ccc00c00cc094008cdc000098029bab300f30213754601e60426ea8c0900088dcc99801800a44100232533301b3013301d37540022900009bad3021301e375400264a6660366026603a6ea8004530103d87a80001323300100137566044603e6ea8008894ccc084004530103d87a800013232323253330213372291100002153330213371e9101000021301033026375000297ae014c0103d87a8000133006006003375a60460066eb8c084008c094008c08c004c8cc004004008894ccc0800045300103d87a800013232323253330203372291100002153330203371e9101000021300f33025374c00297ae014c0103d87a8000133006006003375660440066eb8c080008c090008c088004c0040048894ccc8cccc08c00c4c8c8c8c8c8c8cc030008004cdc5245012800002533301f337100069007099b80483c80400c54ccc07ccdc4001a410004266e00cdc0241002800690068b2999811000899b8a4881035b5d2900005133714911035b5f2000333300800133714911025d290000522333009009002300600122333009009002001375860400046eb4c078004c8cdd81ba8301e001374e603e0026ea800c4c94ccc0800044cdc52441027b7d00003133714911037b5f200032323300100100322533302300110031533302330260011323330090093022001337149101023a2000333009009302300100430250011323330090093022001337149101023a20003330090093023001300633003003302700230250013371491102207d000033756006264a666040002266e29221025b5d00003133714911035b5f2000333300600133714911015d000032233300700700230040012233300700700200137580066e292201022c2000133005375a0040022646466e2922010268270000132333001001300a371a00466e292201012700003222533301e33710004900008008991919199803003180780299b8b33700004a66604266e2000920141481805206e3371666e000054ccc084cdc4000a4028290300a40dc00866e18009202033706002901019b8e004002375c0044444646600200200a44a666040002200a2a6660406046002266006604400200a266008604400266004004604600244646600200200644a666032601a002266e29220101300000315333019337100029000099b8a489012d003300200233702900000089980299b8400148050cdc599b803370a002900a240c00066002002444a66602c66e2400920001001133300300333708004900a19b8b3370066e140092014481800052825114a02a666026600e602a6ea8034528899299980a1806180b1baa001153301549011c4552524f523a20496e76616c69642077696e6e657220696e6465782e0014a02a6660286660286464660020026eb0c070c074c074c074c074c074c074c074c074c064dd500911299980d8008a5013253330183371e6eb8c078008010528899801801800980f0009bae301a30173754002941288a9980aa481274552524f523a204d697373696e67207369676e6174757265206f66207468652077696e6e65722e0014a02a6602a9211057696e6e65722076657269666965642e0014a266646002002444a666034004298103d87a8000132325333018300c003130073301d375200497ae013330050050013006003301e003375c60380046eb0c014c058dd50031bad30193016375401a6e012001374a900019b8948000dd6980098099baa003230163017001230150013013301037540042a6601c9201154552524f523a204d697373696e6720446174756d2e0016370e900000580580580598089809001180800098061baa002370e90010a99804a4811f4552524f523a20496e76616c69642076616c696461746f722075736167652e0016300d300e002300c001300c002300a001300637540022930a998022491856616c696461746f722072657475726e65642066616c73650013656153300249011972656465656d65723a20546f6e74696e6552656465656d657200165734ae7155ceaab9e5573eae815d0aba257481";
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
    "addr_test1qr3vvne9wyjqpnut2j3xaw47x7cqjgfcqpj468xddqng7pv7hpeqvvj26jpvszt4xldx6jrtksnaunwcq96a7zr3ndtsz43mua"
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
    <h2 className="text-2xl font-semibold mb-6 text-center">Contribuez pour la mise de la tontine</h2>
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
