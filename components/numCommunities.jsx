import { Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { pullNum } from "@/utils";

export const NumCommunities = () => {
  const [auth, setAuth] = useState();
  const [chain, setChain] = useState();
  const [numCommunities, setNumCommunities] = useState(0);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setAuth(isConnected);
  }, [isConnected]);  

  useEffect(() => {
    if (auth) {
      (async function () {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId == "0xa4ec") {
          setChain(true);
          await pullNum(setNumCommunities);
        } else {
          setChain(false);
        }
      })();
    }
  }, [auth]);

  return (
    <>
      <Text fontSize={"30px"} color={"white"} fontWeight={"extrabold"}>
        Number of communities
      </Text>
      <Text fontSize={"30px"} color={"white"} fontWeight={"extrabold"}>
        {numCommunities}
      </Text>
    </>
  );
};
