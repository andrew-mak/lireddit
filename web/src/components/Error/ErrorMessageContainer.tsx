import React from "react";
import { Center, Box, Text, Flex } from "@chakra-ui/react";

type ErrorMessageContainerProps = {
  error: Error | null;
  header?: string;
  message?: string;
};

const ErrorMessageContainer: React.FC<ErrorMessageContainerProps> = ({
  error,
  header,
  message,
}) => {
  let extraMessage = null as null | string;
  if (error?.message.includes("[Network]")) {
    extraMessage = "Please, check network connection and refresh the page.";
  } else {
    extraMessage = "Please, refresh the page or otherwise try again later.";
  }
  return (
    <Center
      mt="48px"
      mx="auto"
      px={["12px", "30px"]}
      border="1px solid #e57373"
      borderRadius="lg"
      width="100%"
      maxW="620px"
      minHeight="200px"
      bgColor="#fff4e5"
    >
      <Flex flexDir="column">
        <Box fontSize="xl" as="h4" mb="18px" mx="auto">
          {header || "Something went wrong... :("}
        </Box>
        <Text mb="10px" fontSize="lg">
          {message || extraMessage}
        </Text>
        {extraMessage ? (
          <Text mb="10px" fontSize="lg">
            Otherwise try again later.
          </Text>
        ) : null}
        {error ? <Text fontSize="sm">{error.message}</Text> : null}
      </Flex>
    </Center>
  );
};

export default ErrorMessageContainer;
