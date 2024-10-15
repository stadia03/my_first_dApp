import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import axios from "axios";
import "../styles/Home.css";
import { useEffect, useState } from "react";

const apiKey = "DZHbnZioln7-ITlLrhFgZZlcSSiP3yan";

export default function Home() {
  const { publicKey, connected, sendTransaction } = useWallet(); // Get the public key and connection status
  const { connection } = useConnection();
  const [displayedPublicKey, setDisplayedPublicKey] = useState("");
  const [balance, setBalance] = useState(0);
  //show their pub addres
  useEffect(() => {
    if (connected && publicKey) {
      setDisplayedPublicKey(publicKey.toString()); // Set the public key when connected
      getBalance();
    } else {
      setDisplayedPublicKey(""); // Clear the public key when not connected
      getBalance();
    }
  }, [connected, publicKey]);

  //get the user balance
  const getBalance = async () => {
    if (!connected) {
      // alert("No wallet connected.");
      setBalance(0);
      return;
    }
    try {
      const response = await axios.post(
        `https://solana-devnet.g.alchemy.com/v2/${apiKey}`,
        {
          id: 1,
          jsonrpc: "2.0",
          method: "getBalance",
          params: [displayedPublicKey],
        }
      );
      console.log(response);
      setBalance(response.data.result.value / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // airdroping SOL
  const airdropSol = async () => {
    if (!displayedPublicKey) {
      // setError("No wallet connected.");
      alert("No wallet connected.");
      return;
    }

    try {
      const response = await axios.post(
        `https://solana-devnet.g.alchemy.com/v2/${apiKey}`,
        {
          id: 1,
          jsonrpc: "2.0",
          method: "requestAirdrop",
          params: [displayedPublicKey, LAMPORTS_PER_SOL], // 1 SOL = 1,000,000,000 lamports
        }
      );

      // Check for errors in the response
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      console.log("Airdrop Response:", response.data); // Log the full response

      // You may want to check the transaction signature or status here

      alert("Airdrop successful!");
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      // setError("Airdrop failed. Please try again.");
    }
  };

  // SEND TOKENS

  const sendToken = async () => {
    const toElement = document.getElementById("receiver_address") as HTMLInputElement | null;
    const amountElement = document.getElementById("sending_amount") as HTMLInputElement | null;
  
    if (!toElement || !amountElement) {
      alert("Input elements not found.");
      return;
    }
  
    let to = toElement.value.trim();
    let amount = amountElement.value.trim();
  
    if (!to || !amount) {
      alert("Please enter both receiver address and amount.");
      return;
    }
  
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }
  
    try {
      if (!publicKey) {
        alert("Wallet not connected.");
        return;
      }
  
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(to),
          lamports: numericAmount * LAMPORTS_PER_SOL,
        })
      );
  
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');
  
      alert(`Sent ${numericAmount} SOL to ${to}`);
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert("Transaction failed: " + error.message);
    }
  }
  
  return (
    <div className="container">
      <div className="wallet-buttons">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>

      <h4 id="owner_address">Your Address: {displayedPublicKey}</h4>

      <div className="balance-section">
        <div className="balance-info">Your balance: {balance} SOL </div>
        <button className="refresh-btn" onClick={getBalance}>
          Refresh Balance
        </button>
      </div>

      <div className="airdrop-section">
        <button className="airdrop-btn" onClick={airdropSol}>
          Airdrop 1 SOL
        </button>
      </div>

      <h4 className="transfer-heading">Transfer Funds</h4>

      <div className="transfer-section">
        <input
          id="receiver_address"
          className="input-box"
          placeholder="Receiver Address"
        />
        <input
          id="sending_amount"
          className="input-box"
          placeholder="Amount"
          style={{ width: "150px" }}
        />
        <button className="send-btn" onClick={sendToken}>
          SEND
        </button>
      </div>
    </div>
  );
}
