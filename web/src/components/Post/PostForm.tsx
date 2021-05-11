import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Box, Button, Flex, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import InputField from "../UI/InputField";
import WarnAlertDialog from "../UI/Alert/AlertDialog";
import { simpleValidation } from "../../utils/simpleValidation";

export type FormFields = {
  title: string | undefined;
  text: string | undefined;
};

interface PostFormProps {
  initial: FormFields;
  router: any;
  onSubmitFormHandler: (
    values: { title: string; text: string },
    setSubmiting: (b: boolean) => void
  ) => Promise<void>;
}

const PostForm: React.FC<PostFormProps> = ({
  initial,
  onSubmitFormHandler,
  router,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const { title, text } = initial;
  const onAlertClose = () => setShowAlert(false);

  return (
    <Flex
      width={["100%", "80%", "70%", "55%", "40%"]}
      mx="auto"
      mt="32px"
      bg="white"
      py="32px"
      px={["13px", "26px", "32px", "35px"]}
      pt="0"
      flexDirection="column"
      border="2px solid #4f94c5"
      borderRadius="md"
      boxShadow="0px 10px 13px -7px slategray, 5px 5px 15px 5px rgba(0,0,0,0)"
    >
      <IconButton
        aria-label="close form"
        tooltip="close form"
        mr={["-8px", "-30px"]}
        type="button"
        alignSelf="flex-end"
        colorScheme="whiteAlpha"
        _focus={{
          boxShadow: "0",
          border: "2px solid gray.800",
        }}
        icon={
          <CloseIcon
            color="gray.600"
            boxSize="13px"
            _hover={{
              boxSize: "16px",
              color: "gray.600",
              transition: "all 0.5s 0s ease",
            }}
          />
        }
        onClick={() => setShowAlert(true)}
      >
        cancel
      </IconButton>
      <Formik
        initialValues={{ title: title, text: text }}
        validate={values =>
          simpleValidation(
            {
              title: {
                required: true,
                minLength: 3,
              },
              text: {
                required: true,
                minLength: 2,
              },
            },
            values
          )
        }
        initialTouched={{ title: false, text: false }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true);
          if (
            values.title &&
            values.title.length &&
            values.text &&
            values.text.length
          ) {
            onSubmitFormHandler(
              values as { title: string; text: string },
              actions.setSubmitting
            );
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              id="title"
              type="title"
              placeholder="title"
              label="Title"
            />
            <Box mt="24px">
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
                height="auto"
              />
            </Box>
            <Flex>
              <Button
                textTransform="capitalize"
                fontWeight="normal"
                mt="32px"
                type="submit"
                isLoading={isSubmitting}
                colorScheme="blue"
                ml="auto"
                px="20px"
              >
                save
              </Button>
              <Button
                textTransform="capitalize"
                fontWeight="normal"
                mt="32px"
                ml="32px"
                colorScheme="gray"
                onClick={() => setShowAlert(true)}
              >
                cancel
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
      {showAlert ? (
        <WarnAlertDialog
          isOpen={showAlert}
          onClose={onAlertClose}
          text={{
            header: "Close without saving",
            description: "If any changes were made they will be lost.",
            confirmButtonText: "Close",
          }}
          onConfirm={() => router.back()}
        />
      ) : null}
    </Flex>
  );
};

export default PostForm;
