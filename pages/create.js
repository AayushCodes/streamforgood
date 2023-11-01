import React from "react";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  Flex,
  Text,
  Input,
  Button,
  Divider,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import Header from "@/components/header";
import abi from "../abi.json";
import { init } from "../utils";
import { SFGContract } from "../utils";
import { initFirebase } from "@/utils";
import { ref as databaseRef, set, get, child } from "firebase/database";

const updateDatabase = async (address, content, link, image) => {
  const init = initFirebase();
  const db = init[0];
  const storageObject = init[1];
  let downloadURL;
  if (image) {
    try {
      const storage = storageRef(storageObject, "images/" + image.name);
      await uploadBytes(storage, image);
      downloadURL = await getDownloadURL(storage);
      console.log(downloadURL);
    } catch (e) {
      console.log(e);
    }
  }
  const json = {
    content: content,
    link: link,
    image: downloadURL,
  };
  await set(databaseRef(db, address), json);
};

const createCommunity = async (initiated, owner, name, desc, fee) => {
  console.log(initiated);
  const signer = initiated[2];
  const contract = new ethers.Contract(SFGContract, abi.abi, signer);
  const x = await contract.deployNewInstance(owner, name, desc, fee);
  console.log(x);
  const receipt = await x.wait();
  const event = receipt.events.find(
    (event) => event.event === "CommunityDeployed"
  );
  console.log(event);
  console.log(receipt);
  const newContractAddress = ethers.utils.defaultAbiCoder.decode(
    ["address"],
    receipt.logs[0].data
  )[0];
  console.log(newContractAddress);
  return newContractAddress;
};

export default function Create() {
  const [initiated, setInitiated] = useState();
  const { address, isConnected } = useAccount();
  const [auth, setAuth] = useState();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");
  const [fee, setFee] = useState();
  const [chain, setChain] = useState();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log(event.target.files[0]);
  };

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
      <Button isDisabled={!(name && content && link && desc && fee && selectedFile)} variant="success" className="button" {...props}>
        {/* {isButtonLoading ? "Creating Your community..." : children} */}
        {isButtonLoading ? <Spinner color="black"/> : children}
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
        <Flex
          bg={"#4B9FF7"}
          flexDir={"column"}
          align={"center"}
          className="h-screen"
        >
          <Header />
          {auth ? (
            chain ? (
              <>
              <Flex marginTop={["100px"]} flexDir={"row"} gap={"200px"}>
                <Flex flexDir={"column"} gap={"20px"}>
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
                    <Box
                      as="label"
                      marginTop={"20px"}
                      htmlFor="file-upload"
                      w="200px"
                      h="50px"
                      bg="blue.600"
                      color="white"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      width={"-moz-max-content"}
                      _hover={{
                        bg: "blue.700",
                      }}
                    >
                      {selectedFile ? selectedFile.name : "Choose Image"}
                      <Input
                        type="file"
                        accept="image/*"
                        id="file-upload"
                        onChange={handleFileChange}
                        display="none"
                      />
                    </Box>
                  </Flex>
                  </Flex>
                  <Divider orientation='vertical' borderWidth={"3px"} opacity={"100%"}/>
                  <Flex flexDir={"column"} gap={"20px"}>
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
                  </Flex>
                </Flex>
                <CreateButton
                height={["40px", "40px", "62px"]}
                width={["200px", "200px", "484px"]}
                border={"1px solid rgba(255, 255, 255, 0.2)"}
                marginTop={"100px"}
                justify={"center"}
                bg={"white"}
                color={"#0F1215"}
                borderRadius={"6px"}
                fontSize={["12px", "12px", "20px"]}
                _hover={{}}
                onClick={async () => {
                  setIsButtonLoading(true);
                  const community = await createCommunity(
                    initiated,
                    address,
                    name,
                    desc,
                    fee
                  );
                  await updateDatabase(
                    community,
                    content,
                    link,
                    selectedFile
                  );
                  // await updateDatabase(address, content, link, selectedFile);
                  setTimeout(() => {
                    setIsButtonLoading(false);
                  }, 1000);
                }}
              >
                Click to Create Your Community
              </CreateButton>
              </>
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
