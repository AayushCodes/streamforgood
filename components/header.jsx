import {
  Flex,
  Image,
  Text,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { ConnectBtn } from "./custmbtn";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Header() {
  return (
    <>
      <Flex
        h={"auto"}
        w={"full"}
        justifyContent={"space-between"}
        px="40"
        py="50"
        align={"center"}
        background={"rgba(0, 0, 0, 0.7)"}
        textColor={"white"}
      >
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
        <Breadcrumb
        fontSize={"20px"}
          spacing="12px"
          separator="|"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink href="/create">Create</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink href="/join">Join</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <ConnectBtn />
      </Flex>
    </>
  );
}
