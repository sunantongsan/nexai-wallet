import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  const [network, setNetwork] = useState("testnet");
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [nodeOnline, setNodeOnline] = useState(false);
  const [reward, setReward] = useState("0");

  // Load wallet from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("nexaiPrivateKey");
    if (savedKey) {
      setPrivateKey(savedKey);
      setAddress("0x" + savedKey.slice(-40));
      updateBalance(network);
    }
  }, []);

  const generateWallet = () => {
    const key = "0x" + crypto.getRandomValues(new Uint8Array(32))
      .reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
    setPrivateKey(key);
    setAddress("0x" + key.slice(-40));
    localStorage.setItem("nexaiPrivateKey", key);
    alert("🔐 Your Private Key:\n\n" + key + "\n\n⚠ Please store it safely!");
    updateBalance(network);
  };

  const importWallet = () => {
    if (privateKey.startsWith("0x") && privateKey.length >= 66) {
      setAddress("0x" + privateKey.slice(-40));
      localStorage.setItem("nexaiPrivateKey", privateKey);
      updateBalance(network);
    } else alert("Invalid Private Key");
  };

  const updateBalance = (net: string) => {
    setBalance(net === "testnet" ? "100000000000" : "0");
    setReward("0");
  };

  const toggleNode = (online: boolean) => {
    setNodeOnline(online);
  };

  const sendToken = () => {
    alert(`Sent token (Simulation).`);
  };

  return (
    <div className="bg-[#0D1117] p-6 rounded-xl shadow-lg w-full max-w-md animate-fade-in-up">
      <h1 className="text-white text-2xl font-bold mb-4">NEXai Wallet</h1>
      
      <label className="block mb-2">Network:</label>
      <select value={network} onChange={e => { setNetwork(e.target.value); updateBalance(e.target.value); }} className="w-full mb-4 p-2 rounded bg-[#161B22] text-white">
        <option value="testnet">Testnet</option>
        <option value="mainnet">Mainnet</option>
      </select>

      <div className="mb-4">
        <button onClick={generateWallet} className="bg-green-600 text-white px-4 py-2 rounded mr-2">Generate Wallet</button>
      </div>

      <div className="mb-4">
        <input type="text" value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder="0x..." className="w-full p-2 rounded bg-[#161B22] text-white mb-2" />
        <button onClick={importWallet} className="bg-blue-600 text-white px-4 py-2 rounded">Import Wallet</button>
      </div>

      {address && (
        <div className="text-white mt-4 space-y-2">
          <p><b>Address:</b> {address}</p>
          <p><b>Balance:</b> {balance} NEXAI</p>
          <p><b>Node Status:</b> {nodeOnline ? "Online" : "Offline"}</p>
          <p><b>Reward:</b> {reward} NEXAI</p>

          <div className="mt-2 space-x-2">
            <button onClick={() => toggleNode(true)} className="bg-purple-600 px-3 py-1 rounded">Go Online</button>
            <button onClick={() => toggleNode(false)} className="bg-gray-600 px-3 py-1 rounded">Go Offline</button>
          </div>

          <div className="mt-4">
            <input type="text" placeholder="Recipient" className="w-full p-2 rounded bg-[#161B22] text-white mb-2" />
            <input type="number" placeholder="Amount" className="w-full p-2 rounded bg-[#161B22] text-white mb-2" />
            <button onClick={sendToken} className="bg-red-600 px-4 py-2 rounded w-full">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
