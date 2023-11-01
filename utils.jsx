import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import abi from "./abi.json";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from 'firebase/storage';

export const SFGContract = "0xB1456850845A2E9304a2EfB519f0a018d8304cDb";

export const pullNum = async (setNumCommunities) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const numDeployed = await contract.getDeployedContractsCount();
  console.log(parseInt(numDeployed._hex));
  setNumCommunities(parseInt(numDeployed._hex));
};

console.log(process.env.DATABASE)

export function initFirebase() {
  const firebaseConfig = {
    apiKey: process.env.API_KEY,
    databaseURL: "https://streamforgood-f8624-default-rtdb.firebaseio.com/",
    authDomain: process.env.AUTH,
    projectId: process.env.PROJ,
    storageBucket: "streamforgood-f8624.appspot.com",
    messagingSenderId: process.env.MESSENGER,
    appId: process.env.APP,
    measurementId: process.env.MEASUREMENT,
  };
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const storage = getStorage(app);  
  return [db, storage];
}

export async function init() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    console.log(chainId);
    const sf = await Framework.create({
      chainId: Number(chainId),
      provider: provider,
    });
    const superSigner = sf.createSigner({ signer: signer });
    console.log(await superSigner.getAddress());
    const gDollar = await sf.loadSuperToken("G$");
    console.log(gDollar);
    return [superSigner, gDollar, signer, address, provider, sf];
  } catch (e) {
    console.log(e);
  }
}
