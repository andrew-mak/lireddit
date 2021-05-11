import React from "react";
import NextLink from "next/link";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface dropdownMenuProps {
  username: string;
  logoutHandler: () => void;
}

const DropdownMenu: React.FC<dropdownMenuProps> = ({
  logoutHandler,
  username,
}) => (
  <Menu>
    <MenuButton
      color="white"
      fontSize="md"
      fontWeight="medium"
      m="auto"
      p="0"
      height="auto"
      bg="transparent"
      borderRadius="sm"
      _hover={{ bg: "transparent" }}
      _active={{ outline: "none", bg: "transparent" }}
      _focus={{ outline: "none" }}
      _focusVisible={{ boxShadow: "0px 0px 0px 1px white" }}
    >
      {username}
      <ChevronDownIcon />
    </MenuButton>
    <MenuList>
      <MenuItem>My Account</MenuItem>
      <NextLink href="/create-post">
        <MenuItem>Create post</MenuItem>
      </NextLink>
      <MenuItem onClick={logoutHandler}>Logout</MenuItem>
    </MenuList>
  </Menu>
);

export default DropdownMenu;
