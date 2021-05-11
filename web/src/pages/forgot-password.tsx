import React, { useState } from "react";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { Form, Formik } from "formik";
import { Button } from "@chakra-ui/button";
import { Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import AuthFormContainer from "../components/Auth/AuthFormContainer";
import InputField from "../components/UI/InputField";
import Layout from "../components/UI/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  const toast = useToast();
  return (
    <Layout bgcolor="white">
      <AuthFormContainer action="resetpas" actionLabel="Reset password">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async values => {
            const response = await forgotPassword(values);
            if (response.error) {
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
            } else setComplete(true);
          }}
        >
          {({ isSubmitting }) =>
            complete ? (
              <Text>
                If an account with that email exists, we sent you an email.
              </Text>
            ) : (
              <Form>
                <InputField
                  name="email"
                  placeholder="email"
                  label="Email"
                  type="email"
                />
                <Button
                  my="32px"
                  fontWeight="normal"
                  colorScheme="red"
                  fontSize="lg"
                  w="100%"
                  borderRadius="sm"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  reset password
                </Button>
              </Form>
            )
          }
        </Formik>
      </AuthFormContainer>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
