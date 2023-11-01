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

const pullDetails = async (setCommunities) => {
  const init = initFirebase();
  const db = init[0];
  console.log(SFGContract);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const numDeployedRaw = await contract.getDeployedContractsCount();
  const numDeployed = parseInt(numDeployedRaw._hex);
  console.log(numDeployed);
  const details = [];
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
    const name = await communityContract.communityName();
    const desc = await communityContract.communityDescription();
    const amountPerMonthRaw = await communityContract.amountPerMonth();
    const amountPerMonth = parseInt(amountPerMonthRaw._hex);
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
    details.push({
      address: deployedAddress,
      name: name,
      desc: desc,
      amountPerMonth: amountPerMonth,
      image: image,
    });
  }
  console.log(details);
  setCommunities(details);
};

export default function Join() {
  const [auth, setAuth] = useState();
  const [chain, setChain] = useState();
  const { address, isConnected } = useAccount();
  const [communities, setCommunities] = useState();
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
          await pullDetails(setCommunities);
        } else {
          setChain(false);
        }
      })();
    }
  }, [auth]);

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
            Communities to choose from
          </Text>
          {communities ? (
            <Flex flexDir={"row"} gap={"50px"}>
              {communities.map((_in) => {
                return (
                  <Card maxW="sm" key={_in}>
                    <CardBody>
                      <Image
                      maxH={"200px"}
                        mx={"auto"}
                        src={_in.image}
                        borderRadius="lg"
                        alt={"community cover image"}
                      />
                      <Stack mt="6" spacing="3">
                        <Heading size="md">{_in.name}</Heading>
                        <Text>{_in.desc}</Text>
                        <Text color="blue.600" fontSize="2xl">
                          {_in.amountPerMonth}G$/mo
                        </Text>
                      </Stack>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                      <ButtonGroup spacing="2">
                        <Button
                          variant="solid"
                          colorScheme="blue"
                          onClick={async () => {
                            await startFlow(
                              initiated,
                              address,
                              _in.address,
                              _in.amountPerMonth
                            );
                          }}
                        >
                          Join Community
                        </Button>
                        <Link href={"/" + _in.address}>
                          <Button variant="ghost" colorScheme="blue">
                            View Community
                          </Button>
                        </Link>
                      </ButtonGroup>
                    </CardFooter>
                  </Card>
                );
              })}
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
            >
              <Text fontSize={"40px"}>Loading</Text>
              <Spinner />
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  );
}
