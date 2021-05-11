import React from "react";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Center, Spinner, useToast } from "@chakra-ui/react";
import PostForm, { FormFields } from "../../../components/Post/PostForm";
import Layout from "../../../components/UI/Layout";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const UpdatePost: React.FC = () => {
  const [, updatePost] = useUpdatePostMutation();
  const [{ data, fetching }] = useGetPostFromUrl();
  const toast = useToast();

  const id = useGetIntId();
  const router = useRouter();
  const initial = {
    title: undefined,
    text: undefined,
  } as FormFields;

  const submitFormHandler = async (
    values: { title: string; text: string },
    setSubmitting: (s: boolean) => void
  ) => {
    const { error } = await updatePost({ ...values, id });
    setSubmitting(false);

    if (error) {
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
    } else router.push(`/post/${id}`);
  };

  if (fetching)
    return (
      <Center mt="10%">
        <Spinner speed="0.7s" thickness="4px" color="blue.500" size="lg" />
      </Center>
    );
  else if (data) {
    if (data.post?.title) initial.title = data.post.title;
    if (data.post?.text) initial.text = data.post.text;
  }

  return (
    <Layout>
      <PostForm
        initial={initial}
        onSubmitFormHandler={submitFormHandler}
        router={router}
      />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(UpdatePost);
