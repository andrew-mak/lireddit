import React from "react";
import { Box } from "@chakra-ui/layout";

const Wrapper: React.FC = ({ children }) => {
  return (
    <Box
      w="100%"
      mt={["36px", "44px", "52px"]}
      pb="10px"
      overflowY="auto"
      h={["96%", "95%", "94%"]}
    >
      {children}
    </Box>
  );
};

export default Wrapper;
