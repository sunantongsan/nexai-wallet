let wallet = { address: "", privateKey: "" };
let nodeOnline = false;
let network = "testnet";

// โหลด wallet จาก localStorage
window.onload = function() {
    loadWallet();
}

// Network select
document.getElementById('network').addEventListener('change', (e)=>{
    network = e.target.value;
    updateBalance();
});

// Generate Wallet (แก้ไขแล้ว)
document.getElementById('generateKey').addEventListener('click', ()=>{
    const key = "0x" + crypto.getRandomValues(new Uint8Array(32))
        .reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'');
    
    wallet.privateKey = key;
    wallet.address = "0x" + key.slice(-40);

    saveWallet();

    // แจ้ง Private Key เต็มให้ผู้ใช้จดเก็บ
    alert("🔐 Your Private Key:\n\n" + key + "\n\n⚠ กรุณาเก็บรักษาให้ดี!");

    showWallet();
});

// Import Wallet
document.getElementById('importKey').addEventListener('click', ()=>{
    const key = document.getElementById('privateKey').value.trim();
    if(key.startsWith("0x") && key.length>=66){
        wallet.privateKey = key;
        wallet.address = "0x" + key.slice(-40);
        saveWallet();
        showWallet();
    } else alert("Invalid Private Key");
});

function showWallet(){
    document.getElementById('walletInfo').style.display = "block";
    document.getElementById('walletAddress').innerText = wallet.address;
    updateBalance();
}

function saveWallet(){
    localStorage.setItem('nexaiPrivateKey', wallet.privateKey);
}

function loadWallet(){
    const savedKey = localStorage.getItem('nexaiPrivateKey');
    if(savedKey){
        wallet.privateKey = savedKey;
        wallet.address = "0x" + savedKey.slice(-40);
        showWallet();
    }
}

// Mock balance
function updateBalance(){
    document.getElementById('walletBalance').innerText =
      network==="testnet" ? "100000000000" : "0";
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

// Send Token (Simulation)
document.getElementById('sendToken').addEventListener('click', ()=>{
    const to = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    document.getElementById('txStatus').innerText =
        `Sent ${amount} NEXAI to ${to} (Simulation only)`;
});
