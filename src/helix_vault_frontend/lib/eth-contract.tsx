import { ethers } from "ethers";
import { getContractEssentials } from "./helpers";
import hstICPAbi from "../abi/HelixStakedICP.json";

// Define the contract address
const hstICPContract: string = "0x25601b4776537E5aF36F650797C86eF4138FA4bC";

// Define the return type interface
interface HstICPContracts {
  hstICPReadContract: ethers.Contract;
  hstICPWriteContract: ethers.Contract;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
}

/**
 * Gets the EigenFi pool contracts for reading and writing
 * @returns Object containing read and write contracts, provider and signer
 */
async function getHstICPContract(): Promise<HstICPContracts> {
  const { provider, signer } = await getContractEssentials();

  const hstICPReadContract = new ethers.Contract(
    hstICPContract,
    hstICPAbi,
    provider
  );

  const hstICPWriteContract = hstICPReadContract.connect(signer);

  return {
    hstICPReadContract,
    hstICPWriteContract,
    provider,
    signer,
  };
}

export { getHstICPContract };
