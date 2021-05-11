import React from "react";
import { useLogoutMutation, useMeQuery } from "../../generated/graphql";
import { useDisclosure } from "@chakra-ui/hooks";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { Avatar } from "@chakra-ui/avatar";
import { Button } from "@chakra-ui/button";
import { Flex, Link } from "@chakra-ui/layout";
import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import DropdownMenu from "./Menu/DropdownMenu";
import SideDrawer from "./Menu/SideDrawer";
import ModalAuth from "../Auth/ModalAuth";
import { isServer } from "../../utils/isServer";
import useCurrentWidth from "../../utils/useCurrentWidth";

const Navbar: React.FC = ({}) => {
  const [, logout] = useLogoutMutation();
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });

  const {
    isOpen: sideDrawerIsOpen,
    onOpen: sideDrawerOpen,
    onClose: sideDrawerClose,
  } = useDisclosure();

  const {
    isOpen: authIsOpen,
    onOpen: onOpenAuth,
    onClose: onCloseAuth,
  } = useDisclosure();

  const screendWidth = useCurrentWidth();
  const isSmallScreen = () => !isServer() && screendWidth && screendWidth < 480;

  const logoutHandler = async () => {
    await logout();
    sideDrawerClose();
    router.reload();
  };

  const addPostHandler = () => {
    sideDrawerClose();
    if (data?.me) {
      router.push("/create-post");
    } else onOpenAuth();
  };

  let createPostBtn: any = null;
  if (!isSmallScreen())
    createPostBtn = (
      <Button
        bgColor="white"
        boxShadow="md"
        borderRadius="md"
        ml="3px"
        px="6px"
        height={["90%", "75%", "65%"]}
        fontWeight="normal"
        _hover={{
          bg: "#badaff",
        }}
        _focus={{ outline: "none" }}
        _focusVisible={{
          boxShadow: "inset 0px 0px 0px 2px white",
          bg: "#badaff",
        }}
        onClick={addPostHandler}
        leftIcon={<AddIcon boxSize="11px" />}
      >
        post
      </Button>
    );

  let navElements = null;

  if (isSmallScreen()) {
    navElements = (
      <>
        {!fetching && data?.me ? (
          <>
            <Avatar
              bg="gray.400"
              mx="13px"
              my="auto"
              size="sm"
              boxShadow="sm"
              loading="lazy"
            />
            <Button
              rightIcon={<ChevronDownIcon />}
              color="white"
              fontSize="md"
              fontWeight="medium"
              borderRadius="sm"
              mr="2px"
              my="auto"
              p="0"
              height="auto"
              bg="transparent"
              _hover={{ bg: "transparent" }}
              _active={{ outline: "none", bg: "transparent" }}
              _focus={{ outline: "none" }}
              _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px white" }}
              onClick={sideDrawerOpen}
            >
              {data.me.username}
            </Button>
          </>
        ) : (
          <Button
            id="menu-btn"
            aria-label="Menu button"
            p="5px"
            height="auto"
            bg="transparent"
            color="white"
            size="lg"
            variant="ghost"
            _hover={{ bg: "transparent" }}
            _active={{ outline: "none", bg: "transparent" }}
            _focus={{ outline: "none" }}
            _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px white" }}
            onClick={sideDrawerOpen}
          >
            {"\u2630"}
          </Button>
        )}
        {sideDrawerIsOpen ? (
          <SideDrawer
            username={!fetching && data?.me ? data.me.username : null}
            isOpen={sideDrawerIsOpen}
            onClose={sideDrawerClose}
            logoutHandler={logoutHandler}
            addPostHandler={addPostHandler}
          />
        ) : null}
      </>
    );
  } else {
    navElements = data?.me ? (
      <>
        <Avatar
          bg="gray.400"
          mx="13px"
          my="auto"
          size="sm"
          boxShadow="sm"
          loading="lazy"
        />
        <DropdownMenu
          username={data.me.username}
          logoutHandler={logoutHandler}
        />
      </>
    ) : (
      <>
        <NextLink href="/login" passHref>
          <Link
            mx="16px"
            color="white"
            fontWeight="normal"
            fontSize="lg"
            borderRadius="sm"
            _hover={{ textDecoration: "none" }}
            _focus={{ border: "none" }}
            _focusVisible={{ boxShadow: "0 0 0 1px white" }}
          >
            Login
          </Link>
        </NextLink>
        <NextLink href="/register" passHref>
          <Link
            mr="16px"
            color="white"
            fontWeight="normal"
            fontSize="lg"
            borderRadius="md"
            _hover={{ textDecoration: "none" }}
            _focus={{ border: "none" }}
            _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px white" }}
          >
            Register
          </Link>
        </NextLink>
      </>
    );
  }

  return (
    <Flex
      as="nav"
      bg="#496579"
      boxShadow="md"
      position="fixed"
      top="0"
      w="100vw"
      maxW="100%"
      zIndex="100"
      flexWrap="wrap"
      h={["unset", "44px", "52px"]}
    >
      <NextLink href="/" passHref>
        <Link
          px="4px"
          m="auto"
          ml={["8px", "8%", "12%", "20%"]}
          size="lg"
          height="auto"
          color="white"
          fontSize={["2xl", "3xl"]}
          fontWeight="medium"
          textShadow="2px 2px 0 #1b9acc, 2px -2px 0 #1b9acc, -2px 2px 0 #1b9acc, -2px -2px 0 #1b9acc, 2px 0px 0 #1b9acc, 0px 2px 0 #1b9acc, -2px 0px 0 #1b9acc, 0px -2px 0 #1b9acc"
          borderRadius="sm"
          _hover={{ textDecoration: "none" }}
          _focus={{ outline: "none" }}
          _focusVisible={{ boxShadow: "inset 0px 0px 0px 1px white" }}
        >
          LiReddit
        </Link>
      </NextLink>
      <Flex
        ml="auto"
        display="flex"
        alignItems="center"
        mr={["16px", "10%", "17%", "25%"]}
        px="1px"
        overflow="hidden"
      >
        {createPostBtn || null}
        {navElements}
      </Flex>
      {authIsOpen ? (
        <ModalAuth
          onClose={onCloseAuth}
          isOpen={authIsOpen}
          headerText="Login to create a post"
          loginSuccess={() => router.push("/create-post")}
        />
      ) : null}
    </Flex>
  );
};

export default Navbar;
