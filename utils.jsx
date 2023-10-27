import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import abi from "./abi.json";

export const SFGContract = "0xbe8a73E5D95698Eb9E2e9eF046f313e06A0b015E"

export const pullNum = async (setNumCommunities) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const numDeployed = await contract.getDeployedContractsCount();
  console.log(parseInt(numDeployed._hex));
  setNumCommunities(parseInt(numDeployed._hex));
};

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
    console.log(gDollar)
      return [superSigner, gDollar, signer, address, provider, sf];
    } catch (e) {
      console.log(e);
    }
  }
  