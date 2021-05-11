import React from "react";
import { useCreatePostMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import PostForm, { FormFields } from "../components/Post/PostForm";
import Layout from "../components/UI/Layout";
import { useToast } from "@chakra-ui/toast";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC = () => {
  const router = useRouter();
  useIsAuth();
  const [, createPost] = useCreatePostMutation();
  const toast = useToast();

  const intial = {
    title: "",
    text: "",
  } as FormFields;

  const submitFormHandler = async (
    values: { title: string; text: string },
    setSubmitting: (s: boolean) => void
  ) => {
    setSubmitting(false);
    const { error, data } = await createPost({ input: values });
    if (data?.createPost) {
      toast({
        title: "Post was created.",
        duration: 2000,
        status: "success",
        position: "top-right",
        description: "Post was successful created.",
        isClosable: true,
      });
      router.push("/");
    } else if (error) {
      console.log("error: ", error);
      toast({
        title: "Changes haven't been saved :(",
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
  };

  return (
    <Layout>
      <PostForm
        initial={intial}
        router={router}
        onSubmitFormHandler={submitFormHandler}
      />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
