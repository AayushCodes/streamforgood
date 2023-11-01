import Link from "next/link";
import { Flex, Image, Text, Button } from "@chakra-ui/react";
import Header from "@/components/header";
import { NumCommunities } from "@/components/numCommunities";

export default function index() {
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
          marginTop={"150px"}
          flexDir={"column"}
          gap={"28px"}
          w={"622px"}
          align={"center"}
        >
          <Text
            fontSize={"80px"}
            fontWeight={"600"}
            textAlign={"center"}
            lineHeight={"85px"}
          >
            Join web3 communities by streaming G$
          </Text>
          <Flex gap={"30px"} marginTop={"50px"}>
            <Link href="./join">
              <Button
                borderRadius={"7px"}
                bg={"white"}
                color={"#0F1215"}
                h={"54px"}
                w={"167px"}
                justify={"center"}
                align={"center"}
                fontFamily={"22px"}
                fontWeight={"700"}
                _hover={{ boxShadow: "0px 1px 12px rgba(255,255,255,0.42)" }}
                _active={{}}
              >
                Join Community
              </Button>
            </Link>
            <Link href="./create">
            <Button
              borderRadius={"7px"}
              bg={"rgba(255,255,255,0.02)"}
              border={"1px solid rgba(255, 255, 255, 0.15)"}
              h={"54px"}
              w={"167px"}
              justify={"center"}
              align={"center"}
              fontFamily={"22px"}
              fontWeight={"700"}
              color={"white"}
              _hover={{
                background: "rgba(255,255,255,0.04)",
                boxShadow: "0px 1px 12px rgba(255,255,255,0.05)",
              }}
              _active={{}}
            >
              Create Community
            </Button>
            </Link>
          </Flex>
          <NumCommunities  />
        </Flex>
      </Flex>
    </>
  );
}
