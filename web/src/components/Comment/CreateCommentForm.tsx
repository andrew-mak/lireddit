import React from "react";
import { useCreateCommentMutation } from "../../generated/graphql";
import { Form, Formik } from "formik";
import { Box, Button, Flex, useToast } from "@chakra-ui/react";
import InputField from "../UI/InputField";
import { useIsAuth } from "../../utils/useIsAuth";
import { simpleValidation } from "../../utils/simpleValidation";

interface formProps {
  postId: number;
  closeCallback: () => void;
}

const CreateCommentForm: React.FC<formProps> = ({ postId, closeCallback }) => {
  useIsAuth();
  const toast = useToast();
  const [, createComment] = useCreateCommentMutation();

  return (
    <Formik
      onSubmit={async values => {
        const { data, error } = await createComment({ postId, ...values });

        if (error) {
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
        } else if (data?.createComment) {
          toast({
            title: "Comment was added.",
            duration: 2000,
            status: "success",
            position: "top-right",
            description: "Comment was successful added.",
            isClosable: true,
          });
          closeCallback();
        }
      }}
      initialValues={{ text: "" }}
      validate={values =>
        simpleValidation({ text: { required: true, minLength: 1 } }, values)
      }
    >
      {({ isSubmitting }) => (
        <Form style={{ width: "100%", transition: "opacity 0.4s 0s ease-out" }}>
          <Box mt="8px" px="2px">
            <InputField
              textarea
              autoFocus
              name="text"
              placeholder="Your comment..."
              label="Comment"
              width="100%"
              mx="auto"
              resize="both"
            />
          </Box>
          <Flex py="28px">
            <Button
              ml="auto"
              textTransform="capitalize"
              fontWeight="normal"
              type="submit"
              isLoading={isSubmitting}
              colorScheme="blue"
            >
              add comment
            </Button>
            <Button
              ml="32px"
              textTransform="capitalize"
              fontWeight="normal"
              onClick={() => closeCallback()}
            >
              cancel
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default CreateCommentForm;
