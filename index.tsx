import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  const [network, setNetwork] = useState("testnet");
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0); // ใช้ number
  const [nodeOnline, setNodeOnline] = useState(false);
  const [reward, setReward] = useState(0); // ใช้ number
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);

  // Load wallet จาก localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("nexaiPrivateKey");
    const savedBalance = localStorage.getItem("nexaiBalance");
    if (savedKey) {
      setPrivateKey(savedKey);
      setAddress("0x" + savedKey.slice(-40));
      setBalance(savedBalance ? parseInt(savedBalance) : 100000000000);
      setReward(0);
    }
  }, []);

  const generateWallet = () => {
    const key = "0x" + crypto.getRandomValues(new Uint8Array(32))
      .reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
    setPrivateKey(key);
    setAddress("0x" + key.slice(-40));
    setBalance(100000000000); // เริ่มด้วย 100B NEXAI
    localStorage.setItem("nexaiPrivateKey", key);
    localStorage.setItem("nexaiBalance", "100000000000");
    alert("🔐 Your Private Key:\n\n" + key + "\n\n⚠ Please store it safely!");
  };

  const copyKey = () => {
    navigator.clipboard.writeText(privateKey)
      .then(() => alert("Private Key copied to clipboard!"))
      .catch(() => alert("Failed to copy!"));
  };

  const importWallet = () => {
    if (privateKey.startsWith("0x") && privateKey.length >= 66) {
      setAddress("0x" + privateKey.slice(-40));
      const savedBalance = localStorage.getItem("nexaiBalance");
      setBalance(savedBalance ? parseInt(savedBalance) : 0);
      localStorage.setItem("nexaiPrivateKey", privateKey);
    } else alert("Invalid Private Key");
  };

  const toggleNode = (online: boolean) => {
    setNodeOnline(online);
  };

  const sendToken = () => {
    if (amount <= 0 || amount > balance) {
      alert("Invalid amount");
      return;
    }
    setBalance(prev => {
      const newBalance = prev - amount;
      localStorage.setItem("nexaiBalance", newBalance.toString());
      return newBalance;
    });
    alert(`Sent ${amount} NEXAI to ${recipient}`);
    setRecipient("");
    setAmount(0);
  };

  const receiveToken = (incoming: number) => {
    setBalance(prev => {
      const newBalance = prev + incoming;
      localStorage.setItem("nexaiBalance", newBalance.toString());
      return newBalance;
    });
    alert(`Received ${incoming} NEXAI`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] p-4">
      <div className="bg-[#161B22] p-6 rounded-xl shadow-lg w-full max-w-md animate-fade-in-up text-white">
        <h1 className="text-2xl font-bold mb-4">NEXai Wallet</h1>

        <label className="block mb-2">Network:</label>
        <select
          value={network}
          onChange={e => setNetwork(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-[#0D1117] text-white border border-gray-600"
        >
          <option value="testnet">Testnet</option>
          <option value="mainnet">Mainnet</option>
        </select>

        <div className="mb-4 flex flex-col space-y-2">
          <button
            onClick={generateWallet}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Generate Wallet
          </button>
          {privateKey && (
            <button
              onClick={copyKey}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Copy Private Key
            </button>
          )}

          <input
            type="text"
            value={privateKey}
            onChange={e => setPrivateKey(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 rounded bg-[#0D1117] text-white border border-gray-600"
          />
          <button
            onClick={importWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Import Wallet
          </button>
        </div>

        {address && (
          <div className="mt-4 space-y-2">
            <p><b>Address:</b> {address}</p>
            <p><b>Balance:</b> {balance} NEXAI</p>
            <p><b>Node Status:</b> {nodeOnline ? "Online" : "Offline"}</p>
            <p><b>Reward:</b> {reward} NEXAI</p>

            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => toggleNode(true)}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded"
              >
                Go Online
              </button>
              <button
                onClick={() => toggleNode(false)}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
              >
                Go Offline
              </button>
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Recipient"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full p-2 rounded bg-[#0D1117] text-white border border-gray-600"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full p-2 rounded bg-[#0D1117] text-white border border-gray-600"
              />
              <button
                onClick={sendToken}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full"
              >
                Send
              </button>
              <button
                onClick={() => {
                  const incoming = prompt("Enter amount received:") || "0";
                  receiveToken(Number(incoming));
                }}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded w-full"
              >
                Receive
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
