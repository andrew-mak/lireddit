import { useEffect, useState } from "react";
import { Post, usePostsQuery } from "../generated/graphql";
import { RequestPolicy } from "@urql/core";
import { Button } from "@chakra-ui/button";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { Box, Center, Flex, Stack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import { Spinner } from "@chakra-ui/spinner";
import PostInLink from "./Post/PostInLink";
import ErrorMessageContainer from "./Error/ErrorMessageContainer";
import { isServer } from "../utils/isServer";
import useCurrentWidth from "../utils/useCurrentWidth";

const LIMIT = 10;

const Posts = () => {
  const [queryVariables, setQueryVariables] = useState({
    variables: { limit: LIMIT, cursor: null as null | string },
    requestPolicy: "cache-first" as RequestPolicy,
  });

  const [loading, setLoading] = useState(false);
  const [needScroll, setNeedScroll] = useState(false);

  const [{ data, fetching, error }] = usePostsQuery({ ...queryVariables });

  const screendWidth = useCurrentWidth();
  const isSmallScreen = () => !isServer() && screendWidth && screendWidth < 480;

  const loadMoreHandler = () => {
    if (data?.posts) {
      let cursor: string | null;
      let policy = "network-only" as RequestPolicy;
      if (data.posts.posts.length) {
        cursor = data.posts.posts[data.posts.posts.length - 1].createdAt;
        policy = "cache-first";
      }
      setLoading(true);
      setNeedScroll(true);
      setQueryVariables(prevState => {
        return {
          ...prevState,
          variables: { ...prevState.variables, cursor: cursor },
          requestPolicy: policy,
        };
      });
    }
  };

  let posts = null;

  useEffect(() => {
    setLoading(false);
  }, [data?.posts.posts.length]);

  useEffect(() => {
    if (!loading && !isServer() && needScroll) {
      if (data?.posts && data.posts.posts) {
        const arr = data.posts.posts;
        // sequence for getting target post  for scrollIntoView
        const n = Math.trunc(arr.length / LIMIT);
        if (n < 1) setNeedScroll(false);
        else {
          const dif = arr.length - n * LIMIT;
          const targetId = arr[arr.length - (dif || LIMIT) - 1].id;
          const target = document.getElementById(
            `post:${targetId}`
          ) as HTMLDivElement;
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
            setNeedScroll(false);
          }
        }
      }
      setNeedScroll(false);
    }
  }, [loading]);

  if (data && data.posts) {
    posts = data.posts.posts.map(post =>
      !post ? null : (
        <PostInLink
          post={post as Post}
          key={post.id}
          smallScreen={Boolean(isSmallScreen())}
        />
      )
    );
  } else if (fetching || loading)
    posts = (
      <Center mt="48px">
        <Spinner speed="0.7s" thickness="4px" color="blue.500" size="xl" />
      </Center>
    );
  else if (error) {
    console.log("error: ", error);
  }

  return error ? (
    <ErrorMessageContainer error={error} />
  ) : (
    <Flex
      flexDirection="column"
      width={["100%", "85%", "70%", "55%", "45%"]}
      mx="auto"
      pt={["8px", "16px", "32px"]}
    >
      <Flex
        alignItems="center"
        mt="4px"
        mb="16px"
        px="8px"
        py="4px"
        width="fit-content"
        border="1px solid #d8d8d8"
        borderRadius="6px"
        bg="#ececec"
      >
        <Box
          fontSize="16px"
          fontWeight="medium"
          letterSpacing="1px"
          textTransform="uppercase"
          border="1px solid cornflowerblue"
          borderRadius="6px"
          px="6px"
          bg="#4f94c5"
          color="white"
        >
          Order:
        </Box>
        <Button
          height="auto"
          mx="12px"
          py="3px"
          pr="5px"
          pl="8px"
          fontSize="14px"
          bgColor="#fbfbfb"
          color="#696969"
          fontWeight="normal"
          boxShadow="sm"
          variant="outline"
          rightIcon={<ArrowUpIcon mx="-2px" p="0" />}
        >
          Newest first
        </Button>
      </Flex>

      <Stack spacing={["12px", "20px", "20px", "32px"]}>{posts}</Stack>
      {fetching || loading ? (
        <>
          <Skeleton height="70px" my="15px" />
          <Skeleton height="70px" my="15px" />
          <Skeleton height="70px" my="15px" />
        </>
      ) : fetching || data?.posts.hasMore ? (
        <Button
          m="auto"
          my="44px"
          color="white"
          bg="blue.600"
          textTransform="capitalize"
          fontWeight="normal"
          _hover={{
            bg: "blue.300",
            color: "white",
          }}
          onClick={loadMoreHandler}
          isLoading={fetching || loading}
        >
          load more
        </Button>
      ) : null}
    </Flex>
  );
};

export default Posts;
