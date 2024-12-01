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

      const validatorScript = "590a21010100323232323232323232322533300332323232325332330093001300b37540042646464a66666602800c2646464a66601e60060022a66602660246ea80245400803854ccc03cc01c0044c94ccc05000403c4c94cccccc0640040400400404c94ccc058c06400c54014044dd6800808180b00098091baa00900e301037540102a66601a6002601e6ea80084c94cc03d240105444154554d00132323232323232325330173001009132323253233301a33301a32533301b33301b533301f00114a2294128251133301b3375e64666002002004980105d8799fa0ff00222533302200210011333003003302500232325333020301830223754006298103d87a8000132533302153330213330213370e004901c2504a229444c8cc004004008894ccc09c00452809919299981299b9100700113371e00e0022660080080046eb8c098c0a8008c0a80045300103d87a80001300833026374c646600200200444a66604e00226605066ec0dd4802999811a514c103d87a80004c0103d87980004bd6f7b630099191919299981399b9000900213302c337606ea4024ccc09d28a6103d87a80004c0103d8798000005153330273371e01200426605866ec0dd4804999813a514c0103d87a80004c0103d879800000313302c337606ea4008ccc09c005300103d87a80004c0103d879800033006006003301e3028375460520066eb8c09c008c0ac008c0a40052f5c06eacc098c08cdd50019b8d001375c6048004980103d87a80004a09445281bac3004301d375401a941288a9980da481284552524f523a20496e76616c6964207061727469636970616e74206b65792064657465637465642e0014a02a666034666034004941288a9980da491f4552524f523a20526f756e64206e756d62657220697320696e76616c69642e0014a02a6660346660346464a6603a920114746f74616c5f696e7075745f6c6f76656c61636500153301d30073750002264a66603a6022603e6ea80044c94cc07d24011677696e6e65725f6f75747075745f6c6f76656c61636500153301f300937500022a66603c66e1c00c0045288a9980fa49394552524f523a20546f74616c206c6f76656c616365206d69736d61746368206265747765656e20696e7075747320616e64206f75747075742e0014a060066eacc018c080dd5181198101baa001153301e4912a4552524f523a204e6f206f757470757420666f756e6420696e20746865207472616e73616374696f6e2e0014a064a666042002298103d87a8000130043302230230014bd701bac302230233023301f37540306466600200264660020026eb0c01cc080dd500c9129998110008a5eb804c8c94ccc080cdd7980518119baa0020161330250023300400400113300400400130260023024001480008894ccc08800840044ccc00c00cc094008cdc000098021bab300730213754600e60426ea8c0900088c94ccc070c050c078dd50008a400026eb4c088c07cdd500099299980e180a180f1baa00114c0103d87a8000132330010013756604660406ea8008894ccc088004530103d87a800013232323253330223372291100002153330223371e9101000021300933027375000297ae014c0103d87a8000133006006003375a60480066eb8c088008c098008c090004c8cc004004008894ccc0840045300103d87a800013232323253330213372291100002153330213371e9101000021300833026374c00297ae014c0103d87a8000133006006003375660460066eb8c084008c094008c08c0052825114a02a666034601c60386ea805054cc06d2410852454445454d455200153301b3005014153301b49124436f6e747269627574696f6e2076616c696461746564207375636365737366756c6c792e0014a2264a660389210657494e4e455200153301c30063750002264a6660386028603c6ea800454cc07524011c4552524f523a20496e76616c69642077696e6e657220696e6465782e0014a02a6660386660386464660020026eb0c090c094c094c094c094c094c094c094c094c084dd500d1129998118008a5013253330203371e6eb8c09800801052889980180180098130009bae3022301f3754002941288a9980ea481274552524f523a204d697373696e67207369676e6174757265206f66207468652077696e6e65722e0014a02a6603a9211057696e6e65722076657269666965642e0014a266646002002444a666044004298103d87a800013232533302030140031300733025375200497ae01333005005001300e0033026003375c60480046eb0c014c078dd50070009bad3020301d37540286e9520003371290001bad3001301b37540164603c603e0024603a00246e64cc008005220100300100122253332333301f00313232323232323300d002001337149101012800002533301b337100069007099b80483c80400c54ccc06ccdc4001a410004266e00cdc0241002800690068b299980f000899b8a4881035b5d2900005133714911035b5f2000333300900133714911025d290000522333009009002300600122333009009002001375860380046eb4c068004c8cdd81ba8301a001374e60360026ea800c4c94ccc0700044cdc52441027b7d00003133714911037b5f200032323300100100322533301f00110031533301f3022001132333009009301e001337149101023a2000333009009301f0010043021001132333009009301e001337149101023a2000333009009301f001300633003003302300230210013371491102207d000033756006264a666038002266e29221025b5d00003133714911035b5f2000333300700133714911015d000032233300700700230040012233300700700200137580066e292201022c2000133006375a0040022646466e29220102682700001323330010013006371a00466e292201012700003222533301a33710004900008008991919199803003180580299b8b33700004a66603a66e2000920141481805206e3371666e000054ccc074cdc4000a4028290300a40dc00866e18009202033706002901019b8e004002375c0046e0120012222323300100100522533301b00110051533301b301e001133003301d001005133004301d00133002002301e0012232330010010032253330143008001133714910101300000315333014337100029000099b8a489012d003300200233702900000089980299b8400148050cdc599b803370a002900a240c00066002002444a66602266e2400920001001133300300333708004900a19b8b3370066e14009201448180004c04cc040dd50010a998072481154552524f523a204d697373696e6720446174756d2e0016370e900000580580580598089809001180800098061baa002370e90010a99804a4811f4552524f523a20496e76616c69642076616c696461746f722075736167652e0016300d300e002300c001300c002300a001300637540022930a998022491856616c696461746f722072657475726e65642066616c73650013656153300249011972656465656d65723a20546f6e74696e6552656465656d657200165734ae7155ceaab9e5573eae815d0aba257481"; 
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
    "addr_test1qzvwhlvvs4vswrjdh8tpd7mx4qzfp0pywvn28gu755zujzdpcjew6rswz46sz2k7ndja0f7lkck4nh8xsj2eah9uqkzqswrpe2"
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

    const validatorScript = "590a21010100323232323232323232322533300332323232325332330093001300b37540042646464a66666602800c2646464a66601e60060022a66602660246ea80245400803854ccc03cc01c0044c94ccc05000403c4c94cccccc0640040400400404c94ccc058c06400c54014044dd6800808180b00098091baa00900e301037540102a66601a6002601e6ea80084c94cc03d240105444154554d00132323232323232325330173001009132323253233301a33301a32533301b33301b533301f00114a2294128251133301b3375e64666002002004980105d8799fa0ff00222533302200210011333003003302500232325333020301830223754006298103d87a8000132533302153330213330213370e004901c2504a229444c8cc004004008894ccc09c00452809919299981299b9100700113371e00e0022660080080046eb8c098c0a8008c0a80045300103d87a80001300833026374c646600200200444a66604e00226605066ec0dd4802999811a514c103d87a80004c0103d87980004bd6f7b630099191919299981399b9000900213302c337606ea4024ccc09d28a6103d87a80004c0103d8798000005153330273371e01200426605866ec0dd4804999813a514c0103d87a80004c0103d879800000313302c337606ea4008ccc09c005300103d87a80004c0103d879800033006006003301e3028375460520066eb8c09c008c0ac008c0a40052f5c06eacc098c08cdd50019b8d001375c6048004980103d87a80004a09445281bac3004301d375401a941288a9980da481284552524f523a20496e76616c6964207061727469636970616e74206b65792064657465637465642e0014a02a666034666034004941288a9980da491f4552524f523a20526f756e64206e756d62657220697320696e76616c69642e0014a02a6660346660346464a6603a920114746f74616c5f696e7075745f6c6f76656c61636500153301d30073750002264a66603a6022603e6ea80044c94cc07d24011677696e6e65725f6f75747075745f6c6f76656c61636500153301f300937500022a66603c66e1c00c0045288a9980fa49394552524f523a20546f74616c206c6f76656c616365206d69736d61746368206265747765656e20696e7075747320616e64206f75747075742e0014a060066eacc018c080dd5181198101baa001153301e4912a4552524f523a204e6f206f757470757420666f756e6420696e20746865207472616e73616374696f6e2e0014a064a666042002298103d87a8000130043302230230014bd701bac302230233023301f37540306466600200264660020026eb0c01cc080dd500c9129998110008a5eb804c8c94ccc080cdd7980518119baa0020161330250023300400400113300400400130260023024001480008894ccc08800840044ccc00c00cc094008cdc000098021bab300730213754600e60426ea8c0900088c94ccc070c050c078dd50008a400026eb4c088c07cdd500099299980e180a180f1baa00114c0103d87a8000132330010013756604660406ea8008894ccc088004530103d87a800013232323253330223372291100002153330223371e9101000021300933027375000297ae014c0103d87a8000133006006003375a60480066eb8c088008c098008c090004c8cc004004008894ccc0840045300103d87a800013232323253330213372291100002153330213371e9101000021300833026374c00297ae014c0103d87a8000133006006003375660460066eb8c084008c094008c08c0052825114a02a666034601c60386ea805054cc06d2410852454445454d455200153301b3005014153301b49124436f6e747269627574696f6e2076616c696461746564207375636365737366756c6c792e0014a2264a660389210657494e4e455200153301c30063750002264a6660386028603c6ea800454cc07524011c4552524f523a20496e76616c69642077696e6e657220696e6465782e0014a02a6660386660386464660020026eb0c090c094c094c094c094c094c094c094c094c084dd500d1129998118008a5013253330203371e6eb8c09800801052889980180180098130009bae3022301f3754002941288a9980ea481274552524f523a204d697373696e67207369676e6174757265206f66207468652077696e6e65722e0014a02a6603a9211057696e6e65722076657269666965642e0014a266646002002444a666044004298103d87a800013232533302030140031300733025375200497ae01333005005001300e0033026003375c60480046eb0c014c078dd50070009bad3020301d37540286e9520003371290001bad3001301b37540164603c603e0024603a00246e64cc008005220100300100122253332333301f00313232323232323300d002001337149101012800002533301b337100069007099b80483c80400c54ccc06ccdc4001a410004266e00cdc0241002800690068b299980f000899b8a4881035b5d2900005133714911035b5f2000333300900133714911025d290000522333009009002300600122333009009002001375860380046eb4c068004c8cdd81ba8301a001374e60360026ea800c4c94ccc0700044cdc52441027b7d00003133714911037b5f200032323300100100322533301f00110031533301f3022001132333009009301e001337149101023a2000333009009301f0010043021001132333009009301e001337149101023a2000333009009301f001300633003003302300230210013371491102207d000033756006264a666038002266e29221025b5d00003133714911035b5f2000333300700133714911015d000032233300700700230040012233300700700200137580066e292201022c2000133006375a0040022646466e29220102682700001323330010013006371a00466e292201012700003222533301a33710004900008008991919199803003180580299b8b33700004a66603a66e2000920141481805206e3371666e000054ccc074cdc4000a4028290300a40dc00866e18009202033706002901019b8e004002375c0046e0120012222323300100100522533301b00110051533301b301e001133003301d001005133004301d00133002002301e0012232330010010032253330143008001133714910101300000315333014337100029000099b8a489012d003300200233702900000089980299b8400148050cdc599b803370a002900a240c00066002002444a66602266e2400920001001133300300333708004900a19b8b3370066e14009201448180004c04cc040dd50010a998072481154552524f523a204d697373696e6720446174756d2e0016370e900000580580580598089809001180800098061baa002370e90010a99804a4811f4552524f523a20496e76616c69642076616c696461746f722075736167652e0016300d300e002300c001300c002300a001300637540022930a998022491856616c696461746f722072657475726e65642066616c73650013656153300249011972656465656d65723a20546f6e74696e6552656465656d657200165734ae7155ceaab9e5573eae815d0aba257481";
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
    "addr_test1qzvwhlvvs4vswrjdh8tpd7mx4qzfp0pywvn28gu755zujzdpcjew6rswz46sz2k7ndja0f7lkck4nh8xsj2eah9uqkzqswrpe2"
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
    .pay.ToAddress(await lucid.wallet().address(), { lovelace: BigInt(26_000_000) })
    .attach.SpendingValidator(validator)
    .addSigner(walletAddress)
    .complete();
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
