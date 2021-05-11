import React, { useState } from "react";
import {
  Post,
  useDeletePostMutation,
  useMeQuery,
} from "../../generated/graphql";
import { useRouter } from "next/router";
import NextLink from "next/link";
import {
  Flex,
  Heading,
  Link,
  LinkBox,
  LinkOverlay,
  Text,
} from "@chakra-ui/layout";
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
import WarnAlertDialog from "../UI/Alert/AlertDialog";
import UpdootSection from "../UpdootSection";
import { isServer } from "../../utils/isServer";
import utilDate from "../../utils/utilDate";

const PostInLink: React.FC<{ post: Post; smallScreen: boolean }> = ({
  post,
  smallScreen,
}) => {
  const [{ data }] = useMeQuery({ pause: isServer() });
  const [isOpen, setIsOpen] = useState(false);
  const [, deletePost] = useDeletePostMutation();
  const router = useRouter();
  const toast = useToast();

  const onAlertClose = () => setIsOpen(false);
  const isOwner = () => data?.me?.id === post.creator.id;

  const deletePostHandler = async () => {
    const { error } = await deletePost({ id: post.id });
    setIsOpen(false);
    if (error) {
      console.log("error: ", error);
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
    } else {
      toast({
        title: "Post was deleted.",
        duration: 2000,
        status: "info",
        position: "top-right",
        description: "Post was successful deleted.",
        isClosable: true,
      });
    }
  };

  const pushIdToPath = () => {
    router.replace(`/#post:${post.id}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  let menu = null;
  if (isOwner()) {
    menu = (
      <Menu>
        <MenuButton
          color="white"
          fontSize="md"
          fontWeight="thin"
          ml="auto"
          mr="6px"
          my="0"
          p="0"
          bg="transparent"
          borderRadius="sm"
          _hover={{ bg: "transparent" }}
          _active={{ outline: "none", bg: "transparent" }}
          _focus={{ outline: "none" }}
          _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px #4da6ff" }}
        >
          {"\u{2022}\u{2022}\u{2022}"}
        </MenuButton>
        <MenuList color="black">
          <NextLink
            href="/post/edit/[id]"
            as={`/post/edit/${post.id}`}
            passHref
          >
            <MenuItem onClick={pushIdToPath}>Edit post</MenuItem>
          </NextLink>
          <MenuItem
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Delete post
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Flex
      direction="column"
      as="article"
      key={post.id}
      id={`post:${post.id}`}
      p="1px"
      bg="#4f94c5"
      shadow="sm"
      border="1px solid white"
      borderRadius="6px"
      minHeight="160px"
      letterSpacing="0.5px"
    >
      <Flex
        alignItems="center"
        pl="6px"
        fontSize="sm"
        letterSpacing="1px"
        color="white"
        borderRadius="5px 5px 0 0"
        background="#4f94c5"
      >
        <Link
          to="/#"
          tabIndex={0}
          fontWeight="medium"
          fontSize="15px"
          mx="12px"
          _focus={{
            boxShadow: "inset 0px 0px 0px 1px #4da6ff",
            outline: "none",
          }}
        >
          {post.creator.username}
        </Link>
        <Tooltip
          label={new Date(+post.createdAt).toLocaleString()}
          fontSize="sm"
          fontWeight="normal"
          aria-label="A tooltip"
        >
          <Flex>{utilDate(post.createdAt)}</Flex>
        </Tooltip>
        {post.updatedAt && post.updatedAt !== post.createdAt ? (
          <Flex ml="10px">
            &nbsp;<i>upd</i>&nbsp;
            <Tooltip
              label={new Date(+post.updatedAt).toLocaleString()}
              fontSize="sm"
              fontWeight="normal"
              aria-label="A tooltip"
            >
              {utilDate(post.updatedAt)}
            </Tooltip>
          </Flex>
        ) : null}
        {menu ? menu : null}
      </Flex>
      <Flex
        flexDirection={smallScreen ? "column-reverse" : "row"}
        flex="1"
        bg="white"
        borderRadius="6px 6px 3px 3px"
      >
        <Flex
          flexDir={smallScreen ? "row" : "column"}
          justifyContent={smallScreen ? "flex-end" : "space-between"}
          px="10px"
          pt={smallScreen ? "0" : "12px"}
          pb={smallScreen ? "0" : "8px"}
          borderRadius="6px"
          bgColor="#f3f3f3"
        >
          <UpdootSection
            postId={post.id}
            points={post.points}
            voteStatus={post.voteStatus}
            direction={smallScreen ? "row" : "column"}
          />
          <NextLink
            href="/post/[id]#comments"
            as={`/post/${post.id}#comments`}
            passHref
          >
            <Link
              onClick={pushIdToPath}
              display="flex"
              alignItems="center"
              ml={smallScreen ? "20px" : "unset"}
              _hover={{ textDecoration: "none" }}
              _focus={{ border: "none" }}
              _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px white" }}
              color="gray.800"
            >
              <ChatIcon boxSize="14px" />
              <Box ml="4px" fontSize="sm">
                {post.commentsAmount}
              </Box>
            </Link>
          </NextLink>
        </Flex>
        <LinkBox
          pt="30px"
          px="12px"
          pb="14px"
          display="flex"
          flexDirection="column"
          flex="1"
          onClick={pushIdToPath}
        >
          <NextLink href="/post/[id]" as={`/post/${post.id}`} passHref>
            <LinkOverlay
              borderRadius="md"
              _focus={{ outline: "none" }}
              _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px #4da6ff" }}
            >
              <Flex flexDirection="column" mr="auto">
                <Heading
                  as="h5"
                  mb="12px"
                  overflowWrap="break-word"
                  wordBreak="break-word"
                  style={{ wordSpacing: "1px" }}
                  fontSize="18px"
                  fontWeight="medium"
                  textAlign="justify"
                >
                  {post.title}
                </Heading>
                <Text
                  my="6px"
                  overflowWrap="break-word"
                  wordBreak="break-word"
                  textAlign="justify"
                  style={{ wordSpacing: "1px" }}
                  whiteSpace="pre-wrap"
                >
                  {post.textSnippet}
                  {post.textSnippet.length >= 180 ? (
                    <span
                      style={{
                        fontSize: "16px",
                        color: "#525252",
                        marginLeft: "8px",
                        letterSpacing: "2px",
                        fontWeight: 600,
                      }}
                    >
                      {"..."}
                    </span>
                  ) : null}
                </Text>
              </Flex>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
      </Flex>
      {isOpen ? (
        <WarnAlertDialog
          isOpen={isOpen}
          onClose={onAlertClose}
          onConfirm={deletePostHandler}
          text={{
            header: "Delete Post",
            description: "Are you sure? You can't undo this action afterwards.",
            confirmButtonText: "Delete",
          }}
        />
      ) : null}
    </Flex>
  );
};

export default PostInLink;
