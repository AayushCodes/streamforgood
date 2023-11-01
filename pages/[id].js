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
  Spinner,
} from "@chakra-ui/react";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import abi_comm from "../abi_community.json";
import { init } from "../utils";
import { ref, set, get, child } from "firebase/database";
import { initFirebase } from "@/utils";

const deleteFlow = async (initiated, sender, address) => {
  const signer = initiated[0];
  const gDollar = initiated[1];
  const operation = gDollar.deleteFlow({
    sender: sender,
    receiver: address,
  });
  await operation.exec(signer);
};

const startFlow = async (initiated, sender, address, amountPerMonth) => {
  const signer = initiated[0];
  const gDollar = initiated[1];
  const amountInWei = ethers.BigNumber.from(
    ethers.utils.parseEther(String(amountPerMonth))
  );
  const calculatedFlowRateRaw = amountInWei.div(3600 * 24 * 30);
  console.log(parseInt(calculatedFlowRateRaw._hex));
  const calculatedFlowRate = parseInt(calculatedFlowRateRaw._hex);
  const operation = gDollar.createFlow({
    sender: sender,
    receiver: address,
    flowRate: calculatedFlowRate,
  });
  await operation.exec(signer);
};

const pullDetails = async (
  id,
  initiated,
  address,
  setStreaming,
  setName,
  setDesc,
  setAmount,
  setContent,
  setLink
) => {
  console.log(id);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const sf = initiated[5];
  const signer = provider.getSigner();
  const communityContract = new ethers.Contract(id, abi_comm.abi_comm, signer);
  const name = await communityContract.communityName();
  const desc = await communityContract.communityDescription();
  setName(name);
  setDesc(desc);
  const amountPerMonthRaw = await communityContract.amountPerMonth();
  const amountPerMonth = parseInt(amountPerMonthRaw._hex);
  setAmount(amountPerMonth);
  const amountInWei = ethers.BigNumber.from(
    ethers.utils.parseEther(String(amountPerMonth))
  );
  const calculatedFlowRateRaw = amountInWei.div(3600 * 24 * 30);
  console.log(parseInt(calculatedFlowRateRaw._hex));
  const calculatedFlowRate = parseInt(calculatedFlowRateRaw._hex);
  console.log(calculatedFlowRate);
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
  else {
    setStreaming(false);
  }
  const init = initFirebase();
  const db = init[0];
  let content, link;
  await get(child(ref(db), id))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(data);
        content = data.content;
        link = data.link;
      } else {
        console.error("No data available");
      }
      setContent(content);
      setLink(link);
    })
    .catch((error) => {
      console.error(error);
    });
};

export default function Community() {
  const [auth, setAuth] = useState();
  const [chain, setChain] = useState();
  const { address, isConnected } = useAccount();
  const [initiated, setInitiated] = useState();
  const router = useRouter();
  const [streaming, setStreaming] = useState();
  const [name, setName] = useState();
  const [desc, setDesc] = useState();
  const [content, setContent] = useState();
  const [link, setLink] = useState();
  const { id } = router.query;
  const [amount, setAmount] = useState(0);

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
          setAmount,
          setContent,
          setLink
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
          bg={"#4B9FF7"}
          fontFamily={"Space Grotesk, sans-serif"}
          color={"white"}
          align={"center"}
          flexDir={"column"}
          className="h-screen"
        >
          <Header />
          {streaming != undefined ? (
          <Flex
            marginTop={"40px"}
            flexDir={"column"}
            gap={"10px"}
            w={"-moz-fit-content"}
            align={"center"}
          >
            <Text
              fontSize={"50px"}
              fontWeight={"600"}
              textAlign={"center"}
              lineHeight={"85px"}
              marginTop={"80px"}
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
            {streaming ? (
              <>
                <Card
                  align="center"
                  textAlign={"center"}
                  marginTop={"80px"}
                  background={"rgba(255,255,255,0.5)"}
                >
                  <CardBody>
                    <Text fontSize={"30px"} fontWeight={"bold"}>
                      {content}
                    </Text>
                    <Text fontSize={"20px"} marginTop={"20px"}>
                      Community Link: {link}
                    </Text>
                    <Button
                      marginTop={"20px"}
                      variant="solid"
                      colorScheme="facebook"
                      onClick={async () => {
                        await deleteFlow(initiated, address, id);
                      }}
                    >
                      Exit Community
                    </Button>
                  </CardBody>
                </Card>
              </>
            ) : (
              <>
                <Card
                  align="center"
                  marginTop={"80px"}
                  background={"rgba(255,255,255,0.5)"}
                >
                  <CardHeader>
                    <Heading size="xl">
                      Oops! Looks like you are not a part of this community
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize={"20px"}>
                      You need to stream {amount} G$/mo to be a part of this
                      community
                    </Text>
                  </CardBody>
                  <CardFooter>
                    <Button
                      variant="solid"
                      colorScheme="facebook"
                      onClick={async () => {
                        await startFlow(initiated, address, id, amount);
                      }}
                    >
                      Join Community
                    </Button>{" "}
                  </CardFooter>
                </Card>
              </>
            )}
          </Flex>
          ) : (
            <Flex
              display={{ base: "none", lg: "flex" }}
              bg={"#4B9FF7"}
              fontFamily={"Space Grotesk, sans-serif"}
              color={"white"}
              align={"center"}
              flexDir={"column"}
              justifyContent="center"
              className="h-screen"
            >
              <Text fontSize={"40px"}>Loading</Text>
              <Spinner />
            </Flex>
          )}
        </Flex>
    </>
  );
}
