import React from "react";
import { Box } from "@chakra-ui/layout";
import dynamic from "next/dynamic";

const Wrapper = dynamic(() => import("./Wrapper"));
const Navbar = dynamic(() => import("./Navbar"));

const Layout: React.FC<{ bgcolor?: any }> = ({ children, bgcolor }) => {
  return (
    <Box
      bg={bgcolor ? bgcolor : "gray.100"}
      w="100vw"
      h="100vh"
      maxW="100%"
      maxH="100%"
      overflowY="hidden"
    >
      <Navbar />
      <Wrapper>{children}</Wrapper>
    </Box>
  );
};

export default Layout;
