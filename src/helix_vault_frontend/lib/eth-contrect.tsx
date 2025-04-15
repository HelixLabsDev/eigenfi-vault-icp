import { ethers } from "ethers";
import { getContractEssentials } from "./helpers";
import eigenFiPoolAbi from "../abi/HelixStakedICP.json";

// Define the contract address
const eigenFiPoolContract: string =
  "0xce2a90FA013ddcFda275DA27Ed80e8eCf36e200F";

// Define the return type interface
interface EigenFiPoolContracts {
  eigenFiPoolReadContract: ethers.Contract;
  eigenFiPoolWriteContract: ethers.Contract;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
}

/**
 * Gets the EigenFi pool contracts for reading and writing
 * @returns Object containing read and write contracts, provider and signer
 */
async function getEigenFiPoolContract(): Promise<EigenFiPoolContracts> {
  const { provider, signer } = await getContractEssentials();

  const eigenFiPoolReadContract = new ethers.Contract(
    eigenFiPoolContract,
    eigenFiPoolAbi,
    provider
  );

  const eigenFiPoolWriteContract = eigenFiPoolReadContract.connect(signer);

  return {
    eigenFiPoolReadContract,
    eigenFiPoolWriteContract,
    provider,
    signer,
  };
}

export { getEigenFiPoolContract };
