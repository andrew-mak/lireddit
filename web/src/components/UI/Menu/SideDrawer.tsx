import React from "react";
import NextLink from "next/link";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  VStack,
} from "@chakra-ui/react";

interface sideDrawerProps {
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
  logoutHandler?: () => void;
  addPostHandler: () => void;
}

const SideDrawer: React.FC<sideDrawerProps> = ({
  username,
  isOpen,
  onClose,
  logoutHandler,
  addPostHandler,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      motionPreset="slideInRight"
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader pt="48px" pl="24px">
            {username ? (
              <Avatar
                bg="gray.400"
                mx="12px"
                my="auto"
                size="sm"
                boxShadow="sm"
                loading="lazy"
              />
            ) : null}
            {username || "Hi there!"}
          </DrawerHeader>
          <VStack
            spacing="5"
            pt="16px"
            alignItems="flex-start"
            fontSize="lg"
            pl="80px"
          >
            <Divider />
            {username ? (
              <>
                <Box as={NextLink} href="/#">
                  My Account
                </Box>
                <Divider />
              </>
            ) : null}
            <Button
              bg="transparent"
              mt="20px"
              height="auto"
              p="4px"
              fontSize="large"
              fontWeight="normal"
              _hover={{ bg: "transparent" }}
              _focus={{ boxShadow: "0 0 0 2px black" }}
              onClick={addPostHandler}
            >
              Create post
            </Button>
            <Divider />
            {username ? (
              <Button
                bg="transparent"
                mt="20px"
                height="auto"
                p="4px"
                fontSize="large"
                fontWeight="normal"
                _hover={{ bg: "transparent" }}
                _focus={{ boxShadow: "0 0 0 2px black" }}
                onClick={logoutHandler}
              >
                Logout
              </Button>
            ) : (
              <>
                <Box as={NextLink} href="/login">
                  Login
                </Box>
                <Box as={NextLink} href="/register">
                  Register
                </Box>
              </>
            )}
            <Divider />
          </VStack>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default SideDrawer;
