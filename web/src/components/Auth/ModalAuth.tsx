import React from "react";
import { useLoginMutation } from "../../generated/graphql";
import router from "next/router";
import NextLink from "next/link";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  Link,
  useToast,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import InputField from "../UI/InputField";
import { toErrorMap } from "../../utils/toErrorMap";

interface ModalAuthProps {
  isOpen: boolean;
  headerText: string;
  onClose: () => void;
  loginSuccess: () => void;
}

const ModalAuth: React.FC<ModalAuthProps> = ({
  isOpen,
  onClose,
  loginSuccess,
  headerText,
}) => {
  const [, login] = useLoginMutation();
  const toast = useToast();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{headerText || "Login"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Formik
            initialValues={{ usernameOrEmail: "", password: "" }}
            onSubmit={async (values, { setErrors }) => {
              const response = await login(values);
              if (response.data?.login.errors) {
                setErrors(toErrorMap(response.data.login.errors));
              } else if (response.data?.login.user) {
                loginSuccess();
                onClose();
              } else if (response.error) {
                console.log("error: ", response.error);
                toast({
                  title: "Oops, an error occurred :(",
                  duration: null,
                  status: "error",
                  position: "top-right",
                  variant: "left-accent",
                  description: (
                    <>
                      {response.error?.message.includes("[Network]") ? (
                        <p>Issues with network connection.</p>
                      ) : null}
                      <p>Refresh the page or otherwise try again later.</p>
                      <p>{response.error?.message}</p>
                    </>
                  ),
                  isClosable: true,
                });
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  placeholder="username or email"
                  label="Username or Email"
                />
                <Box mt="30px">
                  <InputField
                    name="password"
                    placeholder="password"
                    label="Password"
                    type="password"
                  />
                </Box>
                <Flex>
                  <NextLink href="/forgot-password" passHref>
                    <Link
                      ml="auto"
                      _hover={{ textDecoration: "none" }}
                      _focus={{ outline: "none" }}
                      _focusVisible={{
                        boxShadow: "inset 0px 0px 0px 2px #2196f3",
                      }}
                    >
                      forgot password?
                    </Link>
                  </NextLink>
                </Flex>
                <Button
                  my="32px"
                  fontWeight="normal"
                  fontSize="lg"
                  w="100%"
                  type="submit"
                  colorScheme="blue"
                  borderRadius="sm"
                  isLoading={isSubmitting}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            ml="auto"
            fontWeight="normal"
            onClick={() => router.push("/register")}
          >
            Create account
          </Button>
          <Button
            onClick={onClose}
            fontWeight="normal"
            ml="20px"
            bgColor="gray.200"
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalAuth;
