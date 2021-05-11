import React from "react";
import { Box, Heading } from "@chakra-ui/react";

type AuthFormContainerProps = {
  action: "login" | "register" | "resetpas";
  actionLabel?: string;
};

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({
  children,
  action,
  actionLabel,
}) => {
  return (
    <Box
      w={["100%", "85%", "60%", "45%"]}
      mx="auto"
      mt={["8px", "24px", "48px"]}
      bg="white"
      display="flex"
      flexDirection="column"
      border="1px solid #496579"
      borderBottom="2px solid #496579"
      borderRadius="sm"
    >
      <Box
        display="flex"
        bg="#496579"
        py="4px"
        my="32px"
        height={actionLabel ? "unset" : "20px"}
        width={action != "resetpas" ? "fit-content" : "100%"}
        ml={action != "resetpas" ? "auto" : "unset"}
        px={action != "resetpas" ? "64px" : "unset"}
      >
        {actionLabel ? (
          <Heading
            color="white"
            fontWeight="normal"
            size={action !== "resetpas" ? "lg" : "md"}
            alignSelf="center"
            m="auto"
          >
            {actionLabel}
          </Heading>
        ) : null}
      </Box>
      <Box display="flex" px={["32px", "20%"]} w="100%" flexDirection="column">
        {children}
      </Box>
    </Box>
  );
};

export default AuthFormContainer;
