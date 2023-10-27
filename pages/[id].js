import { useRouter } from "next/router";
import {
  Flex,
  Image,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  Heading,
  Divider,
  ButtonGroup,
} from "@chakra-ui/react";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import abi_comm from "../abi_community.json";
import { init } from "../utils";

const pullDetails = async (
  id,
  initiated,
  address,
  setStreaming,
  setName,
  setDesc,
  setOwner
) => {
  console.log(id);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const sf = initiated[5];
  const signer = provider.getSigner();
  const communityContract = new ethers.Contract(id, abi_comm.abi_comm, signer);
  const name = await communityContract.communityName();
  const desc = await communityContract.communityDescription();
  const owner = await communityContract.communityOwner();
  setName(name);
  setDesc(desc);
  setOwner(owner);
  const amountPerMonthRaw = await communityContract.amountPerMonth();
  const amountPerMonth = parseInt(amountPerMonthRaw._hex);
  const amountInWei = ethers.BigNumber.from(
    ethers.utils.parseEther(String(amountPerMonth))
  );
  const calculatedFlowRateRaw = amountInWei.div(3600 * 24 * 30);
  console.log(parseInt(calculatedFlowRateRaw._hex));
  const calculatedFlowRate = parseInt(calculatedFlowRateRaw._hex);
  console.log(calculatedFlowRate)
  const gDollar = initiated[1];
  const superSigner = initiated[0];
  console.log(address);
  console.log(sf);
  const check = await sf.cfaV1.getFlow({
    superToken: gDollar.address,
    sender: address,
    receiver: id,
    providerOrSigner: superSigner,
  });
  const flowRate = parseInt(check.flowRate);
  if (flowRate == calculatedFlowRate) {
    setStreaming(true);
  }
};

export default function Community() {
  const [auth, setAuth] = useState();
  const [chain, setChain] = useState();
  const { address, isConnected } = useAccount();
  const [communities, setCommunities] = useState([]);
  const [initiated, setInitiated] = useState();
  const router = useRouter();
  const [streaming, setStreaming] = useState(false);
  const [name, setName] = useState();
  const [desc, setDesc] = useState();
  const [owner, setOwner] = useState();
  const { id } = router.query;

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
          setInitiated(await init());
        } else {
          setChain(false);
        }
      })();
    }
  }, [auth]);

  useEffect(() => {
    if (initiated) {
      (async function () {
        await pullDetails(
          id,
          initiated,
          address,
          setStreaming,
          setName,
          setDesc,
          setOwner
        );
      })();
    }
  }, [id, initiated, address]);

  if (!id) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Flex
        display={{ base: "none", lg: "flex" }}
        height={"100vh"}
        bg={"#4B9FF7"}
        fontFamily={"Space Grotesk, sans-serif"}
        color={"white"}
        align={"center"}
        flexDir={"column"}
      >
        <Header />
        <Flex
          marginTop={"80px"}
          flexDir={"column"}
          gap={"10px"}
          w={"700px"}
          align={"center"}
        >
          <Text
            fontSize={"50px"}
            fontWeight={"600"}
            textAlign={"center"}
            lineHeight={"85px"}
          >
            Welcome to the {name} Community!
          </Text>
          <Text
            fontSize={"30px"}
            fontWeight={"400"}
            textAlign={"center"}
            lineHeight={"85px"}
          >
            {desc}
          </Text>
          <Text
            fontSize={"30px"}
            fontWeight={"400"}
            textAlign={"center"}
            lineHeight={"40px"}
          >
            Owner: {owner}
          </Text>
          {streaming ? (
            <Text
              fontSize={"30px"}
              fontWeight={"400"}
              textAlign={"center"}
              lineHeight={"40px"}
            >
              You be streaming
            </Text>
          ) : (
            <Text
              fontSize={"30px"}
              fontWeight={"400"}
              textAlign={"center"}
              lineHeight={"40px"}
              marginTop={"200px"}
            >
              You no be streaming :)
            </Text>
          )}
        </Flex>
      </Flex>
    </>
  );
}
