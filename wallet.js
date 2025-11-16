const networks = {
    testnet: {
        rpc: "https://nexai-testnet-rpc.blockchainnode.dev",
        chainId: 7070
    },
    mainnet: {
        rpc: "https://nexai-mainnet-rpc.blockchainnode.dev",
        chainId: 7071
    }
};

let wallet = { address: "", privateKey: "" };
let nodeOnline = false;
let network = "testnet";

// Network select
document.getElementById('network').addEventListener('change', (e)=>{
    network = e.target.value;
    updateBalance();
});

// Generate Wallet
document.getElementById('generateKey').addEventListener('click', ()=>{
    const key = "0x" + crypto.getRandomValues(new Uint8Array(32)).reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'');
    wallet.privateKey = key;
    wallet.address = "0x" + key.slice(-40); // Simple address for demo
    showWallet();
});

// Import Wallet
document.getElementById('importKey').addEventListener('click', ()=>{
    const key = document.getElementById('privateKey').value.trim();
    if(key.startsWith("0x") && key.length>=42){
        wallet.privateKey = key;
        wallet.address = "0x" + key.slice(-40);
        showWallet();
    } else alert("Invalid Private Key");
});

function showWallet(){
    document.getElementById('walletInfo').style.display = "block";
    document.getElementById('walletAddress').innerText = wallet.address;
    updateBalance();
}

// Mock balance & reward
function updateBalance(){
    // ใน Testnet: 100B initial
    document.getElementById('walletBalance').innerText = network==="testnet"? "100000000000" : "0";
    document.getElementById('nodeReward').innerText = "0";
}

// Online / Offline Node
document.getElementById('goOnline').addEventListener('click', ()=>{
    nodeOnline = true;
    document.getElementById('nodeStatus').innerText = "Online";
});

document.getElementById('goOffline').addEventListener('click', ()=>{
    nodeOnline = false;
    document.getElementById('nodeStatus').innerText = "Offline";
});

// Send Token
document.getElementById('sendToken').addEventListener('click', ()=>{
    const to = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;
    document.getElementById('txStatus').innerText = `Sent ${amount} NEXAI to ${to} (Simulation)`;
});
