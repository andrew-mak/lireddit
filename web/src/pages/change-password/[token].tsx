import React, { useState } from "react";
import { useChangePasswordMutation } from "../../generated/graphql";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { Form, Formik } from "formik";
import { Button } from "@chakra-ui/button";
import { Box, Flex, Link } from "@chakra-ui/layout";
import AuthFormContainer from "../../components/Auth/AuthFormContainer";
import InputField from "../../components/UI/InputField";
import Layout from "../../components/UI/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <Layout>
      <AuthFormContainer action="resetpas" actionLabel="Set new password">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              newPassword: values.newPassword,
              token:
                typeof router.query.token === "string"
                  ? router.query.token
                  : "",
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                placeholder="new password"
                label="New Password"
                type="password"
              />
              {tokenError ? (
                <Flex>
                  <Box mr="16px" style={{ color: "red" }}>
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password" passHref>
                    <Link>click here to get a new one</Link>
                  </NextLink>
                </Flex>
              ) : null}
              <Button
                my="32px"
                fontWeight="normal"
                colorScheme="blue"
                fontSize="lg"
                w={["100%", "80%", "50%"]}
                borderRadius="sm"
                type="submit"
                isLoading={isSubmitting}
              >
                change password
              </Button>
            </Form>
          )}
        </Formik>
      </AuthFormContainer>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
