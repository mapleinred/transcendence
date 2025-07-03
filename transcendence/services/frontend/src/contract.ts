
//import { ethers } from "ethers";
import { fetchDBTournamentID, setDBTournamentId } from "./main.js";
declare const ethers: any;

let provider: any;
let signer: any;
let contract: any;

const contractAddress = "0xf9ae782823ae9c2894dc1552809e2748085aebfa"; //to replace with smart contract address
const contractABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "tournamentID", "type": "uint256" },
            { "internalType": "uint8[]", "name": "ranks", "type": "uint8[]" },
            { "internalType": "string[]", "name": "alias", "type": "string[]" },
            { "internalType": "uint8[]", "name": "scores", "type": "uint8[]"} 
        ],
        "name": "submitScores",
        "outputs": [
            { "internalType": "uint256", "name": "tournamentID", "type": "uint256"}
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tournamentID", "type": "uint256" }
        ],
        "name": "getScores",
        "outputs": [
            { "internalType": "uint8[]", "name": "ranks", "type": "uint8[]" },
            { "internalType": "string[]", "name": "aliases", "type": "string[]" },
            { "internalType": "uint8[]", "name": "scores", "type": "uint8[]" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tournamentID",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "TournamentCreated",
        "type": "event"
      }
];
//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const contract = new ethers.Contract(contractAddress, contractABI, provider);


//const provider = new ethers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"); // Avalanche C-Chain RPC
//console.log("📜 Contract ABI:", contract.interface.format(ethers.utils.FormatTypes.full));

export async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return null;
    }

    try {
        // Create provider & request accounts
        let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        let signer = provider.getSigner();
        let address = await signer.getAddress();
        console.log("🔗 Connected address:", address);
        await new Promise(res => setTimeout(res, 500)); // Allow MetaMask to settle
        let { chainId } = await provider.getNetwork();
        console.log("🔗 Connected to chain ID:", chainId);
        const requiredChainId = 43113; // Fuji Testnet

        if (chainId !== requiredChainId) {
            console.log(`🔄 Switching from Chain ${chainId} to ${requiredChainId}...`);

            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0xA869" }],
                });

                // 🚀 FIX: Reinitialize provider & signer after network switch
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                address = await signer.getAddress();
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    console.log("🌐 Adding Fuji Testnet to MetaMask...");
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0xA869",
                                chainName: "Avalanche Fuji Testnet",
                                nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
                                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                                blockExplorerUrls: ["https://testnet.snowtrace.io/"],
                            },
                        ],
                    });
                } else {
                    console.error("❌ Failed to switch network:", switchError);
                    return null;
                }
            }
        }

        // 🚀 FIX: Reinitialize provider & signer after switching
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        address = await signer.getAddress();

        // Initialize the contract with the new signer
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        alert("✅ Wallet connected successfully");
        return address;
    } catch (error) {
        console.error("❌ Error connecting wallet:", error);
        alert("Failed to connect wallet. Please try again.");
        return null;
    }
}

// Function to increment tournament ID
async function incrementTournamentID(): Promise<number> {
    const res = await fetch('/increment-tournament-id', {
      method: 'POST'
    });
  
    if (!res.ok) {
      throw new Error('Failed to increment tournament ID');
    }
  
    const data = await res.json();
    return data.tournament_id;
  }
  
  export async function submitScores(tournamentID: number, ranks: number[], aliases: string[], scores: number[]) {
    if (!tournamentID) {
      alert("Invalid tournament ID");
      throw new Error("Invalid tournament ID");
    }
  
    const fixedAliases = aliases.map(a => String(a));
  
    try {
      const statusMessage = document.getElementById("statusMessage");
      if (statusMessage) statusMessage.innerText = "Submitting scores...";
  
      const newID: number = await fetchDBTournamentID();
      const tx = await contract.submitScores(newID, ranks, fixedAliases, scores);
  
      const receipt = await tx.wait();
  
      if (receipt.status !== 1) {
        throw new Error("Transaction failed");
      }
  
      if (statusMessage) {
        statusMessage.innerHTML = `
          <span style="color: green;">
            Scores submitted successfully! ✅<br>
            Tx Hash: <a href="https://testnet.snowtrace.io/tx/${tx.hash}" target="_blank">${tx.hash}</a>
          </span>
        `;
      }
  
      try {
        const newID = await incrementTournamentID();
        console.log(`✅ Tournament ID incremented: ${newID}`);
      } catch (err) {
        console.error("❌ Failed to increment tournament ID:", err);
      }
  
    } catch (error: any) {
      console.error("Error submitting scores:", error);
  
      const statusMessage = document.getElementById("statusMessage");
      if (statusMessage) {
        if (error.code === 4001 || error.message?.includes("User rejected")) {
          statusMessage.innerHTML = `<span style="color: red;">❌ Transaction rejected by user.</span>`;
        } else {
          statusMessage.innerHTML = `<span style="color: red;">❌ Error submitting scores. Please try again.</span>`;
        }
      }
  
      // Re-throw so caller knows it failed
      throw error;
    }
  }
  

export async function fetchScoresFromBlockchain(tournamentID: number): Promise<{ rank: number; alias: string; score: number }[]> {

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
        // Destructure the three arrays returned by the contract
        console.log("Fetching scores from contract...");
        console.log("Tournament ID:", tournamentID);
        console.log(provider.getCode(contractAddress));
        //const [ranks, aliases, scores]: [number[], string[], number[]] = await contract.getScores(tournamentID);
        const result = await contract.callStatic.getScores(tournamentID);
        console.log("Raw contract response:", result);
        const [ranks, aliases, scores]: [number[], string[], number[]] = result;
        console.log("Fetched scores:", ranks, aliases, scores);
        // Ensure all arrays have the same length
        if (ranks.length !== aliases.length || ranks.length !== scores.length) {
            throw new Error("Mismatched array lengths from contract");
        }
        console.log("Fetched scores2:", ranks, aliases, scores);
        // Convert them into an array of objects
        return ranks.map((rank, index) => ({
            rank: Number(rank),
            alias: aliases[index],
            score: Number(scores[index]),
        }));
    } catch (error) {
        console.error("Error fetching scores:", error);
        return [];
    }
}

export async function getLatestTournamentID(): Promise<number | null> {
    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    console.log("🛰️ Provider and contract initialized");
  
    try {
      console.log("🔍 Querying latest block...");
      const latestBlock = await provider.getBlockNumber();
      console.log(`latestblock: ${latestBlock}`);
  
      const step = 2048;
      const startBlock = Math.max(latestBlock - 100000, 0); // look back up to 100k blocks
      const topic = ethers.utils.id("TournamentCreated(uint256,address)");
  
      let allEvents: any[] = [];
  
      for (let i = startBlock; i <= latestBlock; i += step) {
        const fromBlock = i;
        const toBlock = Math.min(i + step - 1, latestBlock);
  
        try {
          const logs = await provider.getLogs({
            fromBlock,
            toBlock,
            address: contract.address,
            topics: [topic],
          });
  
          const parsed = logs.map((log: any) => contract.interface.parseLog(log));
          allEvents.push(...parsed);
        } catch (err) {
          console.error(`⚠️ Failed to fetch logs from ${fromBlock} to ${toBlock}`, err);
        }
      }
  
      console.log("📦 Events fetched:", allEvents.length);
  
      if (allEvents.length === 0) {
        console.log("No tournaments found.");
        return null;
      }
  
      const tournamentIDs = allEvents.map((e: any, i: number) => {
        const id = e.args?.tournamentID?.toNumber?.() ?? 0;
//        console.log(`🔢 Event ${i}: tournamentID =`, id);
        return id;
      });
  
      const latestID = Math.max(...tournamentIDs);
      console.log("✅ Latest Tournament ID:", latestID);
      return latestID;
    } catch (error) {
      console.error("❌ Error fetching TournamentCreated events:", error);
      return null;
    }
  }
  

//export fetchScoresFromBlockchain;



//document.getElementById("connectWallet").addEventListener("click", connectWallet);
//document.getElementById("submitScores").addEventListener("click", submitScores);

//display score
//getscore button
//dropdown?
//getElementByID?

