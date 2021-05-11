import React, { useEffect, useState } from "react";
import { useDeletePostMutation, useMeQuery } from "../../generated/graphql";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Button,
  Collapse,
  Spinner,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { ChatIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, Flex, Heading, Link, Text } from "@chakra-ui/layout";
import CreateCommentForm from "../../components/Comment/CreateCommentForm";
import Comments from "../../components/Comments";
import ModalAuth from "../../components/Auth/ModalAuth";
import WarnAlertDialog from "../../components/UI/Alert/AlertDialog";
import Layout from "../../components/UI/Layout";
import ErrorMessageContainer from "../../components/Error/ErrorMessageContainer";
import UpdootSection from "../../components/UpdootSection";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { isServer } from "../../utils/isServer";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import utilDate from "../../utils/utilDate";

const PostPage: React.FC = ({}) => {
  const [{ data, fetching, error }] = useGetPostFromUrl();

  const [showAlert, setShowAlert] = useState(false);
  const me = useMeQuery({ pause: isServer() })[0].data?.me;
  const router = useRouter();

  const {
    isOpen: authIsOpen,
    onOpen: onOpenAuth,
    onClose: onCloseAuth,
  } = useDisclosure();

  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  const [isAddComment, setIsAddComment] = useState(false);
  const [, deletePost] = useDeletePostMutation();

  const onAlertClose = () => setShowAlert(false);

  const deletePostHandler = async () => {
    setShowAlert(false);
    if (post) {
      let { data, error } = await deletePost({ id: post.id });
      if (data?.deletePost) {
        router.push("/");
        toast({
          title: "Post was deleted.",
          duration: 2000,
          status: "info",
          position: "top-right",
          description: "Post was successful deleted.",
          isClosable: true,
        });
      } else if (error) {
        toast({
          title: "The post hasn't been deleted :(",
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

  const addCommentHandler = () => {
    if (me?.id) {
      setIsAddComment(true);
      onToggle();
    } else onOpenAuth();
  };

  const closeCommentFormCallback = () => {
    setIsAddComment(false);
    onToggle();
  };

  const post = data?.post;
  let pagePost = null;
  let date = null;
  let updDate = null;
  const isAuthor = post?.creator.id === me?.id;

  useEffect(() => {
    if (router.asPath.includes("#comments")) {
      router.push(router.asPath, undefined, { shallow: true });
    }
  }, [data?.post]);

  if (post) {
    date = new Date(+post.createdAt);
    if (post.createdAt !== post.updatedAt) {
      updDate = post.updatedAt;
    }
    pagePost = (
      <Flex
        bg="white"
        flexDirection="column"
        my="32px"
        mx="auto"
        width={["100%", "85%", "75%", "65%", "50%"]}
        px={["19px", "26px", "32px", "40px"]}
      >
        <Flex as="article" minHeight="40%" flexDirection="column">
          <Flex
            alignItems="center"
            mt="16px"
            justifyContent="space-between"
            flexWrap="wrap"
            mb={isAuthor ? "6px" : "16px"}
          >
            <Flex alignItems="center" flexWrap="wrap">
              <Avatar
                bg="gray.400"
                mr="13px"
                my="auto"
                size="sm"
                boxShadow="sm"
                name={post.creator.username}
              />
              <Link
                to="/#"
                tabIndex={0}
                borderRadius="sm"
                _focusVisible={{ outlineColor: "#4da6ff" }}
                fontWeight="medium"
                wordBreak="break-word"
              >
                {post.creator.username}
              </Link>
              <Flex ml="18px" alignItems="center" fontSize="sm">
                <Tooltip
                  label={new Date(+post.createdAt).toLocaleString()}
                  fontSize="sm"
                  fontWeight="normal"
                  aria-label="A tooltip"
                >
                  <Center color="gray.700">
                    {date.toLocaleString("en-GB", { dateStyle: "medium" })}
                  </Center>
                </Tooltip>
                {updDate ? (
                  <Tooltip
                    label={new Date(+updDate).toLocaleString()}
                    fontSize="sm"
                    fontWeight="normal"
                    aria-label="A tooltip"
                  >
                    <Center ml="8px" color="gray.600">
                      <i> upd </i>&nbsp;
                      {utilDate(updDate)}
                    </Center>
                  </Tooltip>
                ) : null}
              </Flex>
            </Flex>
            <Flex alignItems="center" mr="4px" color="gray.600">
              <Link href={`${router.asPath}#comments`}>
                <ChatIcon boxSize="14px" m="4px" />
              </Link>
              {post.commentsAmount}
            </Flex>
          </Flex>
          {isAuthor ? (
            <Flex alignItems="center" ml="auto" color="gray.600">
              <NextLink href="/post/edit/[id]" as={`/post/edit/${post.id}`}>
                <IconButton
                  mb="3px"
                  mx="6px"
                  minWidth="12px"
                  h="12px"
                  size="sm"
                  _hover={{ bg: "none" }}
                  _focus={{ boxShadow: "none" }}
                  aria-label="edit post"
                  bg="transparent"
                  icon={
                    <Tooltip
                      label="Edit post"
                      fontSize="sm"
                      aria-label="A tooltip"
                      shouldWrapChildren={true}
                    >
                      <EditIcon />
                    </Tooltip>
                  }
                />
              </NextLink>
              <Tooltip label="Delete post" fontSize="sm" aria-label="A tooltip">
                <IconButton
                  m="2px"
                  ml="6px"
                  minWidth="12px"
                  h="12px"
                  size="sm"
                  aria-label="delete post"
                  _hover={{ bg: "none" }}
                  _focus={{ boxShadow: "none" }}
                  bg="transparent"
                  icon={<DeleteIcon />}
                  onClick={() => setShowAlert(true)}
                />
              </Tooltip>
              {showAlert ? (
                <WarnAlertDialog
                  isOpen={showAlert}
                  onClose={onAlertClose}
                  text={{ header: "Delete post" }}
                  onConfirm={deletePostHandler}
                />
              ) : null}
            </Flex>
          ) : null}
          <Flex flexDirection="column">
            <Heading
              as="h2"
              fontSize="lg"
              fontWeight="medium"
              overflowWrap="break-word"
              wordBreak="break-word"
              style={{ wordSpacing: "1px" }}
            >
              {post.title}
            </Heading>
            <Text
              my="24px"
              textAlign="justify"
              whiteSpace="break-spaces"
              overflowWrap="break-word"
              wordBreak="break-word"
              style={{ wordSpacing: "1px" }}
            >
              {post.text}
            </Text>
          </Flex>
        </Flex>
        <Flex
          id="comments"
          mb="10px"
          alignItems="center"
          px={["16px", "28px", "38px", "42px"]}
        >
          <UpdootSection
            postId={post.id}
            points={post.points}
            voteStatus={post.voteStatus}
            direction="row"
          />
          {!isAddComment ? (
            <Button
              ml="auto"
              textTransform="capitalize"
              onClick={addCommentHandler}
              transition="opacity 0.4s 0s ease-out"
            >
              Comment
            </Button>
          ) : null}
        </Flex>
        <Collapse in={isOpen} animateOpacity unmountOnExit>
          <CreateCommentForm
            postId={post.id}
            closeCallback={closeCommentFormCallback}
          />
        </Collapse>
        {post.commentsAmount > 0 ? (
          <Comments postCreatorId={post.creator.id} />
        ) : null}
      </Flex>
    );
  }
  return (
    <Layout>
      {fetching ? (
        <Center mt="32px">
          <Spinner speed="0.7s" thickness="3px" color="blue.500" size="lg" />
        </Center>
      ) : error ? (
        <ErrorMessageContainer error={error} />
      ) : pagePost ? (
        pagePost
      ) : (
        <ErrorMessageContainer
          error={null}
          header="Could not find the post :("
          message="It seems this post doesn't exist."
        />
      )}
      {onCloseAuth ? (
        <ModalAuth
          onClose={onCloseAuth}
          loginSuccess={onToggle}
          isOpen={authIsOpen}
          headerText="Login to comment"
        />
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(PostPage);
