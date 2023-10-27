import React from "react";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { Flex, Text, Input, Button, Image, Select } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { Spinner } from "react-bootstrap";
import Header from "@/components/header";
import abi from "../abi.json";
import { init } from "../utils";
import { SFGContract } from "../utils";

const createCommunity = async (initiated, owner, name, desc, fee) => {
  console.log(initiated);
  const signer = initiated[2];
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const x = await contract.deployNewInstance(owner, name, desc, fee);
  console.log(x);
};

export default function Create() {
  const [initiated, setInitiated] = useState();
  const { address, isConnected } = useAccount();
  const [auth, setAuth] = useState();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");
  const [fee, setFee] = useState(0);
  const [chain, setChain] = useState();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

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
    setAuth(isConnected);
  }, [isConnected]);

  function CreateButton({ isLoading, children, ...props }) {
    return (
      <Button variant="success" className="button" {...props}>
        {isButtonLoading ? (
          <Spinner variant="dark" animation="border" />
        ) : (
          children
        )}
      </Button>
    );
  }

  const handleNameChange = (e) => {
    setName(() => ([e.target.name] = e.target.value));
  };

  const handleDescChange = (e) => {
    setDesc(() => ([e.target.name] = e.target.value));
  };

  const handleFeeChange = (e) => {
    setFee(() => ([e.target.name] = e.target.value));
  };

  const handleContentChange = (e) => {
    setContent(() => ([e.target.name] = e.target.value));
  };

  const handleLinkChange = (e) => {
    setLink(() => ([e.target.name] = e.target.value));
  };

  return (
    <>
      {initiated ? (
        <Flex bg={"#4B9FF7"} flexDir={"column"} align={"center"} height="100vh">
          <Header />
          {auth ? (
            chain ? (
              <Flex marginTop={["50px"]} flexDir={"column"} gap={"20px"}>
                <Text
                  fontSize={"30px"}
                  color={"white"}
                  fontWeight={"extrabold"}
                >
                  For Public
                </Text>
                <Flex gap={"13px"} flexDir={"column"}>
                  <Text
                    fontSize={["14px", "14px", "20px"]}
                    color={"white"}
                    fontWeight={"medium"}
                  >
                    Community Name
                  </Text>
                  <Input
                    width={["200px", "200px", "484px"]}
                    height={["40px", "40px", "62px"]}
                    border={"1px solid rgba(255,255,255,0.40)"}
                    borderRadius={"6px"}
                    bg={"none"}
                    color={"white"}
                    fontSize={["12px", "12px", "18px"]}
                    _hover={{}}
                    focusBorderColor={"rgba(255, 255, 255, 0.5)"}
                    value={name}
                    onChange={handleNameChange}
                    placeholder="What do we call your community?"
                    _placeholder={{ color: "rgba(255,255,255,0.60)" }}
                  />
                </Flex>
                <Flex gap={"13px"} flexDir={"column"}>
                  <Text
                    fontSize={["14px", "14px", "20px"]}
                    color={"white"}
                    fontWeight={"medium"}
                  >
                    Description
                  </Text>
                  <Input
                    width={["200px", "200px", "484px"]}
                    height={["40px", "40px", "62px"]}
                    border={"1px solid rgba(255,255,255,0.40)"}
                    borderRadius={"6px"}
                    bg={"none"}
                    color={"white"}
                    fontSize={["12px", "12px", "18px"]}
                    _hover={{}}
                    focusBorderColor={"rgba(255, 255, 255, 0.5)"}
                    value={desc}
                    onChange={handleDescChange}
                    placeholder="Let us know more about your vibe"
                    _placeholder={{ color: "rgba(255,255,255,0.60)" }}
                  />
                  <Text
                    fontSize={["14px", "14px", "20px"]}
                    color={"white"}
                    fontWeight={"medium"}
                  >
                    Subscription Fee (in G$/mo)
                  </Text>
                  <Input
                    width={["200px", "200px", "484px"]}
                    height={["40px", "40px", "62px"]}
                    border={"1px solid rgba(255,255,255,0.40)"}
                    borderRadius={"6px"}
                    bg={"none"}
                    color={"white"}
                    fontSize={["12px", "12px", "18px"]}
                    _hover={{}}
                    focusBorderColor={"rgba(255, 255, 255, 0.5)"}
                    value={fee}
                    onChange={handleFeeChange}
                    placeholder="What do you wanna charge your users in G$/mo"
                    _placeholder={{ color: "rgba(255,255,255,0.60)" }}
                  />
                </Flex>

                <Text
                  fontSize={"30px"}
                  color={"white"}
                  fontWeight={"extrabold"}
                >
                  For Members
                </Text>
                <Flex gap={"13px"} flexDir={"column"}>
                  <Text
                    fontSize={["14px", "14px", "20px"]}
                    color={"white"}
                    fontWeight={"medium"}
                  >
                    Exclusive Content
                  </Text>
                  <Input
                    width={["200px", "200px", "484px"]}
                    height={["40px", "40px", "62px"]}
                    border={"1px solid rgba(255,255,255,0.40)"}
                    borderRadius={"6px"}
                    bg={"none"}
                    color={"white"}
                    fontSize={["12px", "12px", "18px"]}
                    _hover={{}}
                    focusBorderColor={"rgba(255, 255, 255, 0.5)"}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Some content only your streamers can see"
                    _placeholder={{ color: "rgba(255,255,255,0.60)" }}
                  />
                </Flex>
                <Flex gap={"13px"} flexDir={"column"}>
                  <Text
                    fontSize={["14px", "14px", "20px"]}
                    color={"white"}
                    fontWeight={"medium"}
                  >
                    Link to your community
                  </Text>
                  <Input
                    width={["200px", "200px", "484px"]}
                    height={["40px", "40px", "62px"]}
                    border={"1px solid rgba(255,255,255,0.40)"}
                    borderRadius={"6px"}
                    bg={"none"}
                    color={"white"}
                    fontSize={["12px", "12px", "18px"]}
                    _hover={{}}
                    focusBorderColor={"rgba(255, 255, 255, 0.5)"}
                    value={link}
                    onChange={handleLinkChange}
                    placeholder="Where can we find you?"
                    _placeholder={{ color: "rgba(255,255,255,0.60)" }}
                  />
                </Flex>

                <CreateButton
                  height={["40px", "40px", "62px"]}
                  width={["200px", "200px", "484px"]}
                  marginRight={["8px", "8px", "16px"]}
                  border={"1px solid rgba(255, 255, 255, 0.2)"}
                  justify={"center"}
                  bg={"white"}
                  color={"#0F1215"}
                  borderRadius={"6px"}
                  fontSize={["12px", "12px", "20px"]}
                  _hover={{}}
                  onClick={async () => {
                    setIsButtonLoading(true);
                    createCommunity(initiated, address, name, desc, fee);
                    setTimeout(() => {
                      setIsButtonLoading(false);
                    }, 1000);
                  }}
                >
                  Click to Create Your Community
                </CreateButton>
              </Flex>
            ) : (
              <Flex marginTop={"350px"} w={"400px"} color={"white"}>
                <Text fontSize={"28px"} fontWeight={"medium"}>
                  Change Network to Celo
                </Text>
              </Flex>
            )
          ) : (
            <Flex marginTop={"350px"} w={"518px"} color={"white"}>
              <Text fontSize={"28px"} fontWeight={"medium"}>
                Connect Wallet to start using streamfi
              </Text>
            </Flex>
          )}
        </Flex>
      ) : (
        ""
      )}
    </>
  );
}
