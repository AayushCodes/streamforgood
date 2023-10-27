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
  Link
} from "@chakra-ui/react";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import abi from "../abi.json";
import abi_comm from "../abi_community.json";
import { SFGContract, init } from "../utils";

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
        flowRate: calculatedFlowRate
    })
    await operation.exec(signer);
}

const pullDetails = async (setCommunities) => {
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
    const owner = await communityContract.communityOwner();
    const name = await communityContract.communityName();
    const desc = await communityContract.communityDescription();
    const amountPerMonthRaw = await communityContract.amountPerMonth();
    const amountPerMonth = parseInt(amountPerMonthRaw._hex);
    details.push({
      address: deployedAddress,
      owner: owner,
      name: name,
      desc: desc,
      amountPerMonth: amountPerMonth,
    });
  }
  console.log(details);
  setCommunities(details);
};

export default function Join() {
  const [auth, setAuth] = useState();
  const [chain, setChain] = useState();
  const { address, isConnected } = useAccount();
  const [communities, setCommunities] = useState([]);
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
          <Flex flexDir={"row"} gap={"50px"}>
            {communities.map((_in) => (
              <Card maxW="sm" key={_in}>
                <CardBody>
                  <Image
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                    alt="Green double couch with wooden legs"
                    borderRadius="lg"
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
                    <Button variant="solid" colorScheme="blue" onClick={async () => {
                        await startFlow(initiated, address, _in.address, _in.amountPerMonth);
                    }}>
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
            ))}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
