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
  Link,
} from "@chakra-ui/react";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import abi from "../abi.json";
import abi_comm from "../abi_community.json";
import { SFGContract, init } from "../utils";
import { ref, set, get, child } from "firebase/database";
import { initFirebase } from "@/utils";

const deleteCommuntiy = async (initiated, index) => {
  console.log(initiated);
  const signer = initiated[2];
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const x = await contract.deleteInstance(index);
  console.log(x);
  await x.wait();
};

const deleteFlow = async (initiated, sender, address) => {
  const signer = initiated[0];
  const gDollar = initiated[1];
  const operation = gDollar.deleteFlow({
    sender: sender,
    receiver: address,
  });
  await operation.exec(signer);
};

const pullDetails = async (
  initiated,
  address,
  setOwnedCommunities,
  setPartCommunities
) => {
  const init = initFirebase();
  const sf = initiated[5];
  const superSigner = initiated[0];
  const db = init[0];
  const gDollar = initiated[1];
  console.log(SFGContract);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const numDeployedRaw = await contract.getDeployedContractsCount();
  const numDeployed = parseInt(numDeployedRaw._hex);
  console.log(numDeployed);
  const ownedDetails = [];
  const partDetails = [];
  for (let i = 0; i <= numDeployed - 1; i++) {
    console.log(typeof i);
    console.log(i);
    const deployedAddress = await contract.deployedCommunities(parseInt(i));
    console.log(deployedAddress);
    const communityContract = new ethers.Contract(
      deployedAddress,
      abi_comm.abi_comm,
      signer
    );
    const owner = await communityContract.communityOwner();
    const name = await communityContract.communityName();
    const desc = await communityContract.communityDescription();
    const amountPerMonthRaw = await communityContract.amountPerMonth();
    const amountPerMonth = parseInt(amountPerMonthRaw._hex);
    const amountInWei = ethers.BigNumber.from(
      ethers.utils.parseEther(String(amountPerMonth))
    );
    const calculatedFlowRateRaw = amountInWei.div(3600 * 24 * 30);
    console.log(parseInt(calculatedFlowRateRaw._hex));
    const calculatedFlowRate = parseInt(calculatedFlowRateRaw._hex);
    console.log(calculatedFlowRate);
    let image;
    await get(child(ref(db), deployedAddress))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log(data);
          image = data.image;
          console.log(image);
        } else {
          console.error("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    if (owner == address) {
      ownedDetails.push({
        index: i,
        address: deployedAddress,
        owner: owner,
        name: name,
        desc: desc,
        amountPerMonth: amountPerMonth,
        image: image,
      });
    }
    const check = await sf.cfaV1.getFlow({
      superToken: gDollar.address,
      sender: address,
      receiver: deployedAddress,
      providerOrSigner: superSigner,
    });
    const flowRate = parseInt(check.flowRate);
    if (flowRate == calculatedFlowRate) {
      partDetails.push({
        address: deployedAddress,
        name: name,
        desc: desc,
        amountPerMonth: amountPerMonth,
        image: image,
      });
    }
  }
  console.log(partDetails);
  console.log(ownedDetails);
  setPartCommunities(partDetails);
  setOwnedCommunities(ownedDetails);
};

export default function Dashboard() {
  const [auth, setAuth] = useState();
  const [chain, setChain] = useState();
  const { address, isConnected } = useAccount();
  const [partCommunities, setPartCommunities] = useState();
  const [ownedCommunities, setOwnedCommunities] = useState();
  const [initiated, setInitiated] = useState();
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
          if (initiated) {
            await pullDetails(
              initiated,
              address,
              setOwnedCommunities,
              setPartCommunities
            );
          }
        } else {
          setChain(false);
        }
      })();
    }
  }, [auth, initiated, address]);

  return (
    <>
      {initiated ? (
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
          {ownedCommunities ? (
            <Flex marginTop={"80px"}>
              <Flex
                flexDir={"column"}
                gap={"28px"}
                w={"700px"}
                align={"center"}
              >
                <Text
                  fontSize={"50px"}
                  fontWeight={"600"}
                  textAlign={"center"}
                  lineHeight={"85px"}
                >
                  Communities you own
                </Text>
                <Flex flexDir={"column"} gap={"50px"}>
                  {ownedCommunities.map((_in) => {
                    return (
                      <Card
                        key={_in}
                        direction={{ base: "column", sm: "row" }}
                        overflow="hidden"
                        variant="outline"
                      >
                        <Image
                          maxH={"200px"}
                          my={"auto"}
                          src={_in.image}
                          borderRadius="lg"
                          alt={"community cover image"}
                        />
                        <Stack>
                          <CardBody>
                            <Heading size="lg">{_in.name}</Heading>

                            <Text fontSize={"20px"}>{_in.desc}</Text>
                            <Text color="blue.600" fontSize="2xl">
                              {_in.amountPerMonth}G$/mo
                            </Text>
                          </CardBody>

                          <CardFooter>
                            <ButtonGroup spacing="2">
                              <Button
                                variant="solid"
                                colorScheme="red"
                                onClick={async () => {
                                  await deleteCommuntiy(initiated, _in.index);
                                }}
                              >
                                Delete Community
                              </Button>
                            </ButtonGroup>
                          </CardFooter>
                        </Stack>
                      </Card>
                    );
                  })}
                </Flex>
              </Flex>
              <Flex
                flexDir={"column"}
                gap={"28px"}
                w={"700px"}
                align={"center"}
              >
                <Text
                  fontSize={"50px"}
                  fontWeight={"600"}
                  textAlign={"center"}
                  lineHeight={"85px"}
                >
                  Communities you joined
                </Text>
                <Flex flexDir={"column"} gap={"50px"}>
                  {partCommunities.map((_in) => {
                    return (
                      <Card
                        key={_in}
                        direction={{ base: "column", sm: "row" }}
                        overflow="hidden"
                        variant="outline"
                      >
                        <Image
                          maxH={"200px"}
                          my={"auto"}
                          src={_in.image}
                          borderRadius="lg"
                          alt={"community cover image"}
                        />
                        <Stack>
                          <CardBody>
                            <Heading size="lg">{_in.name}</Heading>

                            <Text fontSize={"20px"}>{_in.desc}</Text>
                            <Text color="blue.600" fontSize="2xl">
                              {_in.amountPerMonth}G$/mo
                            </Text>
                          </CardBody>

                          <CardFooter>
                            <ButtonGroup spacing="2">
                              <Button
                                variant="solid"
                                colorScheme="red"
                                onClick={async () => {
                                  await deleteFlow(
                                    initiated,
                                    address,
                                    _in.address
                                  );
                                }}
                              >
                                Exit Community
                              </Button>
                              <Link href={"/" + _in.address}>
                                <Button variant="ghost" colorScheme="blue">
                                  View Community
                                </Button>
                              </Link>
                            </ButtonGroup>
                          </CardFooter>
                        </Stack>
                      </Card>
                    );
                  })}
                </Flex>
              </Flex>
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
              marginTop={"350px"}
            >
              <Text fontSize={"40px"}>Loading</Text>
              <Spinner />
            </Flex>
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
    </>
  );
}
