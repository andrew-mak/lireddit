import React, { useState } from "react";
import { RequestPolicy } from "@urql/core";
import {
  Comment,
  useCommentsQuery,
  useDeleteCommentMutation,
  useMeQuery,
} from "../generated/graphql";
import { CloseIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Center,
  Divider,
  Flex,
  IconButton,
  Link,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import WarnAlertDialog from "./UI/Alert/AlertDialog";
import ErrorMessageContainer from "./Error/ErrorMessageContainer";
import { isServer } from "../utils/isServer";
import { useGetIntId } from "../utils/useGetIntId";
import utilDate from "../utils/utilDate";

const Comments: React.FC<{ postCreatorId: number }> = ({ postCreatorId }) => {
  const postId = useGetIntId();

  const [, deleteComment] = useDeleteCommentMutation();
  const [commentForDel, setCommentForDel] = useState<null | number>(null);

  const userId = useMeQuery({ pause: isServer() })[0].data?.me?.id;
  const isUserPostCreator = () => userId === postCreatorId;

  const [showAlert, setShowAlert] = useState(false);
  const onAlertClose = () => {
    setShowAlert(false);
    setCommentForDel(null);
  };

  const toast = useToast();

  const [queryVariables, setQueryVariables] = useState({
    variables: {
      newestComId: null as null | number,
      limit: 5,
      cursor: null as null | string,
      postId: postId,
    },
    requestPolicy: "cache-and-network" as RequestPolicy,
  });

  const [{ data, fetching, error }] = useCommentsQuery({ ...queryVariables });

  let comments = null as null | Comment[];
  let commentsBlock = null;

  if (data && data.comments && data.comments.comments) {
    comments = data.comments.comments as Comment[];
    commentsBlock = comments.map((comment, i) =>
      !comment ? null : (
        <Flex flexDirection="column" my="4px" key={comment.id}>
          <Divider />
          <Flex alignItems="center" pt="8px" pb="4px">
            <Avatar
              bg="gray.400"
              mr="12px"
              my="auto"
              size="xs"
              boxShadow="sm"
            />
            <Link
              to="/#"
              tabIndex={0}
              borderRadius="sm"
              _focusVisible={{ outlineColor: "#4da6ff" }}
              fontWeight="medium"
              fontSize="sm"
              wordBreak="break-word"
            >
              {comments![i].creator.username}
            </Link>
            <Flex mx="16px" alignItems="flex-end">
              <Tooltip
                label={new Date(+comment.createdAt).toLocaleString()}
                fontSize="sm"
                fontWeight="normal"
                aria-label="A tooltip"
              >
                <Center fontSize="sm">{utilDate(comment.createdAt)}</Center>
              </Tooltip>
            </Flex>
            {isUserPostCreator() || userId === comment.creatorId ? (
              <Tooltip
                label="Delete"
                fontSize="sm"
                fontWeight="normal"
                aria-label="A tooltip"
              >
                <IconButton
                  aria-label="Delete comment"
                  size="xs"
                  _hover={{ bg: "none" }}
                  _focus={{ boxShadow: "none" }}
                  bg="transparent"
                  ml="auto"
                  onClick={() => onDeleteHandler(comment.id)}
                  icon={<CloseIcon boxSize="8px" />}
                />
              </Tooltip>
            ) : null}
          </Flex>
          <Flex ml="36px">
            <Text
              overflowWrap="break-word"
              wordBreak="break-word"
              textAlign="justify"
              style={{ wordSpacing: "1px" }}
            >
              {comments![i].text}
            </Text>
          </Flex>
        </Flex>
      )
    );
  } else if (error) {
    console.log("error: ", error);
    if (
      error?.message === "[GraphQL] Cannot read property 'id' of undefined" &&
      !data?.comments?.comments.length
    )
      commentsBlock = null;
    else {
      commentsBlock = <ErrorMessageContainer error={error} />;
    }
  }
  const loadMoreHandler = () => {
    let newestCom = null as null | Comment;
    let lastFetchedComment = null as null | Comment;
    let policy = "network-only" as RequestPolicy;
    if (comments && comments.length) {
      lastFetchedComment = comments.reduce(
        (prev, cur: any) => (prev != null && cur == null ? prev : cur),
        null
      );
      newestCom = comments.find(comment => comment) || null;
      policy = "cache-and-network";
    }
    setQueryVariables(prevState => {
      return {
        ...prevState,
        variables: {
          ...prevState.variables,
          newestComId: newestCom?.id || null,
          cursor: lastFetchedComment?.createdAt || null,
        },
        requestPolicy: policy,
      };
    });
  };

  const onDeleteHandler = (commentId: number) => {
    setCommentForDel(commentId);
    setShowAlert(true);
  };

  const deleteCommentHandler = async () => {
    setShowAlert(false);
    let result;
    if (commentForDel)
      result = await deleteComment({
        id: commentForDel!,
        postId: postId,
        isPostCreator: isUserPostCreator(),
      });
    if (result?.data?.deleteComment) {
      toast({
        title: "Post was deleted.",
        duration: 2000,
        status: "info",
        position: "top-right",
        description: "Post was successful deleted.",
        isClosable: true,
      });
      setCommentForDel(null);
    } else if (result?.error) {
      console.log("error: ", result.error);
      toast({
        title: "The comment hasn't been deleted.",
        duration: null,
        status: "error",
        position: "top-right",
        variant: "left-accent",
        description: (
          <>
            {result.error?.message.includes("[Network]") ? (
              <p>Issues with network connection.</p>
            ) : null}
            <p>Refresh the page or otherwise try again later.</p>
            <p>{result.error?.message}</p>
          </>
        ),
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      flexDir="column"
      bg="white"
      px={["16px", "28px", "38px", "42px"]}
      pb="16px"
    >
      {fetching ? (
        <Center>
          <Spinner speed="0.7s" thickness="4px" color="blue.500" size="lg" />
        </Center>
      ) : (
        commentsBlock || null
      )}
      {data?.comments?.hasMore ? (
        <Button
          onClick={loadMoreHandler}
          my="32px"
          mx="auto"
          w={["100%", "80%", "50%", "40%"]}
        >
          Load more
        </Button>
      ) : null}
      {showAlert ? (
        <WarnAlertDialog
          isOpen={showAlert}
          onClose={onAlertClose}
          onConfirm={deleteCommentHandler}
          text={{ header: "Delete comment" }}
        />
      ) : null}
    </Flex>
  );
};

export default Comments;
