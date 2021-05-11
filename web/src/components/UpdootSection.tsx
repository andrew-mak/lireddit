import { IconButton } from "@chakra-ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Center, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import React, { useState } from "react";
import { useVoteMutation } from "../generated/graphql";

type UpdootSectionProps = {
  postId: number;
  voteStatus?: number | null | undefined;
  points: number;
  direction: "row" | "column";
};

type voteType = "updoot-loading" | "downdoot-loading" | "not-loading";

const UpdootSection: React.FC<UpdootSectionProps> = ({
  postId,
  voteStatus,
  points,
  direction,
}) => {
  const [loadingState, setLoadingState] = useState<voteType>("not-loading");
  const [, setVoteMutation] = useVoteMutation();

  const toast = useToast();

  const voteHandler = async (type: voteType) => {
    const vote = {
      postId,
      value: 0,
    };

    switch (type) {
      case "updoot-loading":
        setLoadingState("updoot-loading");
        if (voteStatus === 1) break;
        vote.value = 1;
        break;
      case "downdoot-loading":
        setLoadingState("downdoot-loading");
        if (voteStatus === -1) break;
        vote.value = -1;
        break;
      default:
        break;
    }

    if (vote.value === 0) {
      setLoadingState("not-loading");
      return;
    }
    const { error } = await setVoteMutation(vote);
    setLoadingState("not-loading");
    if (error) {
      if (error.message.includes("[GraphQL] not authenticated")) {
        toast({
          title: "Oops, we don't know who are you.",
          duration: 2000,
          status: "info",
          position: "top-right",
          description: "Please, login to vote.",
          isClosable: true,
        });
      } else {
        console.log("error: ", error);
        toast({
          title: "Your vote hasn't been accepted :(",
          duration: null,
          status: "error",
          position: "top-right",
          variant: "left-accent",
          description: (
            <>
              {error.message.includes("[Network]") ? (
                <p>Issues with network connection.</p>
              ) : null}
              <p>Refresh the page or otherwise try again later.</p>
              <p>{error.message}</p>
            </>
          ),
          isClosable: true,
        });
      }
    }
  };

  let pointColor = "#4A5568";
  if (points > 0) pointColor = "#1f861f";
  else if (points < 0) pointColor = "#bd6363";

  return (
    <Flex
      flexDirection={direction}
      alignItems="center"
      alignSelf={direction === "row" ? "center" : "flex-start"}
    >
      <IconButton
        aria-label="updoot post"
        w="19px"
        h="16px"
        minWidth="min-content"
        icon={
          <ChevronUpIcon
            boxSize="26px"
            color={voteStatus === 1 ? "black" : "gray.400"}
            _hover={{ color: "white" }}
          />
        }
        _hover={{ bg: voteStatus === 1 ? "gray.300" : "blue.600" }}
        _focus={{
          boxShadow: "0 0 0 2px #4da6ff",
        }}
        bgColor="transparent"
        isLoading={loadingState === "updoot-loading"}
        onClick={() => voteHandler("updoot-loading")}
      />
      <Box
        boxSizing="border-box"
        width="32px"
        fontWeight="medium"
        fontSize="17px"
        color={pointColor}
      >
        <Center>{points}</Center>
      </Box>
      <IconButton
        aria-label="downdoot post"
        w="19px"
        h="16px"
        minWidth="min-content"
        fontWeight="extrabold"
        icon={
          <ChevronDownIcon
            boxSize="26px"
            color={voteStatus === -1 ? "black" : "gray.400"}
            _hover={{ color: "white" }}
          />
        }
        _focus={{ boxShadow: "0 0 0 2px #4da6ff" }}
        _hover={{ bg: voteStatus === -1 ? "gray.300" : "blue.600" }}
        bgColor="transparent"
        isLoading={loadingState === "downdoot-loading"}
        onClick={() => voteHandler("downdoot-loading")}
      />
    </Flex>
  );
};

export default UpdootSection;
