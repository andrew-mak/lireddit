import React from "react";
import { useLoginMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { Form, Formik } from "formik";
import { Button } from "@chakra-ui/button";
import { Box, Flex, Link } from "@chakra-ui/layout";
import AuthFormContainer from "../components/Auth/AuthFormContainer";
import InputField from "../components/UI/InputField";
import Layout from "../components/UI/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import { useToast } from "@chakra-ui/toast";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  const toast = useToast();

  const routeNext = () => {
    if (typeof router.query.next === "string") router.push(router.query.next);
    else router.push("/");
  };

  return (
    <Layout bgcolor="white">
      <AuthFormContainer action="login" actionLabel="Login">
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const { data, error } = await login(values);
            if (data?.login.errors) {
              setErrors(toErrorMap(data.login.errors));
            } else if (data?.login.user) {
              if (typeof router.query.next === "string")
                router.push(router.query.next);
              else router.push("/");
            } else if (error) {
              console.log("error: ", error);
              toast({
                title: "Oops, an error occurred :(",
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
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="usernameOrEmail"
                placeholder="username or email"
                label="Username or Email"
              />
              <Box mt="28px">
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
                    mt="2px"
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
              <Flex my="32px" justifyContent="flex-end" flexWrap="wrap">
                <Button
                  m="auto"
                  fontWeight="normal"
                  fontSize="lg"
                  textTransform="capitalize"
                  minW="150px"
                  type="submit"
                  colorScheme="blue"
                  borderRadius="sm"
                  isLoading={isSubmitting}
                >
                  login
                </Button>
                <Button
                  bgColor="gray.200"
                  fontWeight="normal"
                  textTransform="capitalize"
                  borderRadius="sm"
                  onClick={routeNext}
                >
                  Cancel
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </AuthFormContainer>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
