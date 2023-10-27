import { Flex, Image, Text, Button, Link } from "@chakra-ui/react";
import { ConnectBtn } from "./custmbtn";

export default function Header() {
  return (
    <>
        <Flex h={"44px"} marginTop={"45px"} gap={"935px"}>
        <Link href="./">
          <Flex gap={"9px"} align={"center"}>
            <Image src={"glogo.png"} alt={"logo"} h={"20px"} />
            <Image src={"x-solid.svg"} alt={"logo"} h={"20px"} />
            <Image src={"superfluid.jpeg"} alt={"logo"} h={"20px"} />
            <Text fontSize={"24px"} fontWeight={"medium"}>
              StreamForGood
            </Text>
          </Flex>
          </Link>
          <ConnectBtn />
        </Flex>
    </>
  );
}
