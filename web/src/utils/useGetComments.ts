import { useCommentsQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetComments = (queryVariables: any) => {
  const intId = useGetIntId();
  return useCommentsQuery({
    pause: intId === -1,
    variables: {
      ...queryVariables,
      postId: intId,
    },
  });
};

