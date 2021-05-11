import React from "react";
import { useRegisterMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { Form, Formik } from "formik";
import { Button } from "@chakra-ui/button";
import { Box, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import AuthFormContainer from "../components/Auth/AuthFormContainer";
import InputField from "../components/UI/InputField";
import Layout from "../components/UI/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

const Register: React.FC = ({}) => {
  const [, register] = useRegisterMutation();
  const router = useRouter();
  const toast = useToast();
  return (
    <Layout bgcolor="white">
      <AuthFormContainer action="register" actionLabel="Register">
        <Formik
          initialValues={{ email: "", username: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const { data, error } = await register({ options: values });
            if (data?.register.errors) {
              [{ field: "usernameOrEmail", message: "something wrong" }];
              setErrors(toErrorMap(data.register.errors));
            } else if (data?.register.user) {
              router.push("/");
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
                name="username"
                placeholder="username"
                label="Username"
              />
              <Box mt="30px">
                <InputField name="email" placeholder="email" label="Email" />
              </Box>
              <Box mt="30px">
                <InputField
                  name="password"
                  placeholder="password"
                  label="Password"
                  type="password"
                />
              </Box>
              <Flex my="32px" justifyContent="flex-end" flexWrap="wrap">
                <Button
                  m="auto"
                  fontWeight="normal"
                  fontSize="lg"
                  textTransform="capitalize"
                  minW="160px"
                  type="submit"
                  colorScheme="blue"
                  borderRadius="sm"
                  isLoading={isSubmitting}
                >
                  Register
                </Button>
                <Button
                  bgColor="gray.200"
                  fontWeight="normal"
                  textTransform="capitalize"
                  borderRadius="sm"
                  onClick={() => router.back()}
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

export default withUrqlClient(createUrqlClient)(Register);
