import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  DeletePostMutationVariables,
  PostDocument,
  PostsDocument,
  CommentsDocument,
  Post,
  Comment
} from "../generated/graphql";
import Router from "next/router";
import { cacheExchange, Resolver, Cache, Data, ResolveInfo, Variables } from "@urql/exchange-graphcache";
import { pipe, tap } from "wonka";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        console.error(error?.message);
        Router.replace("/login?next=" + Router.asPath)
      }
    })
  );
};

const postsPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

const commentsPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {

    const { parentKey: entityKey, fieldName } = info;
    // entityKey:  Query
    // fieldName: "comments", 

    const fields = cache.inspectFields(entityKey);

    const postsFields = fields.filter(info => info.fieldName === fieldName && info.arguments?.postId === fieldArgs.postId);

    if (postsFields.length === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

    const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, "comments");

    info.partial = !isItInTheCache;
    let hasMore = true;
    let newestComId;

    const results: string[] = [];

    postsFields.forEach(fieldItem => {
      const key = cache.resolve(entityKey, fieldItem.fieldKey!) as string;
      const data = cache.resolve(key, "comments") as string[];

      results.push(...data);
      // values from vache
      hasMore = cache.resolve(key, "hasMore") as boolean;
      newestComId = cache.resolve(key, "newestComId");
    })

    return {
      __typename: "PaginatedComments",
      hasMore,
      newestComId: newestComId || null,
      comments: results,
    };
  };
};

function updateComments(cache: Cache, result: Data) {
  // update comments after create new comment
  const res = result.createComment as Comment;
  const fields = cache.inspectFields("Query");

  const filterdFields = fields.filter(info => info.fieldName === "comments" && info.fieldKey.includes(`${res.postId}`));

  const targetField = filterdFields.find(field => !field.hasOwnProperty('cursor'));
  if (targetField) {
    cache.updateQuery({ query: CommentsDocument, variables: { ...targetField.arguments } }, (data: any) => {

      if (data && data.comments) {
        data.comments.comments.unshift(res);
        return data
      }
      else if (!data) return null;
      else return data;
    });
  }
}

function updAfterCrPostOrLogin(cache: Cache, target: "posts" | "comments") {
  const fields = cache.inspectFields("Query");
  const postsFields = fields.filter((info) => info.fieldName === `${target}`);
  postsFields.forEach((fieldItem) => {
    cache.invalidate("Query", target, fieldItem.arguments || {});
  });
}

function updatePost(cache: Cache, args: Variables, info: ResolveInfo) {
  cache.updateQuery({ query: PostDocument, variables: { id: args.postId } }, data => {
    if (data?.post) {
      const post = data.post as Post;
      if (info.fieldName === "deleteComment") post.commentsAmount = post.commentsAmount - 1;
      else if (info.fieldName === "createComment") post.commentsAmount = post.commentsAmount + 1;
      return data;
    }
    else if (!data) return null;
    else return data;
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer() && ctx) {
    if (ctx.req.headers.cookie) { cookie = ctx.req.headers.cookie }
  }

  return {
    url: process.env.NEXT_PUBLIC_API_URL as string,
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? {
        cookie
      } : undefined
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
          PaginatedComments: () => null,
        },
        resolvers: {
          Query: {
            posts: postsPagination(),
            comments: commentsPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (result, args, cache, _info) => {
              if (result.deletePost) {
                cache.inspectFields('Query')
                  .filter(field => field.fieldName === 'posts')
                  .forEach(field => {
                    cache.updateQuery(
                      { query: PostsDocument, variables: { ...field.arguments } },
                      (data: any) => {
                        if (data && data.posts) {
                          const resp = data.posts.posts.filter((post: Post) => post.id !== args.id);
                          data.posts.posts = resp;
                          return data;
                        }
                        else if (!data) return null;
                        else return data;
                      });
                  })
              }
              cache.invalidate({ __typename: "Post", id: (args as DeletePostMutationVariables).id });
            },
            deleteComment: (result, args, cache, info) => {
              if (result.deleteComment) {
                updatePost(cache, args, info);
                cache.inspectFields('Query')
                  .filter(field => field.fieldName === 'comments')
                  .forEach(field => {
                    cache.updateQuery(
                      { query: CommentsDocument, variables: { ...field.arguments } },
                      (data: any) => {
                        if (data && data.comments) {
                          const resp = data.comments.comments.filter((comment: Comment) => comment.id !== args.id);
                          data.comments.comments = resp;
                          return data;
                        }
                        else if (!data) return null;
                        else return data;
                      });
                  })
              }
            },
            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
            login: (_result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              updAfterCrPostOrLogin(cache, "posts");
              updAfterCrPostOrLogin(cache, "comments");
            },
            logout: (_result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            createPost: (_result, _args, cache, _info) => {
              updAfterCrPostOrLogin(cache, "posts");
            },
            createComment: (result, args, cache, info) => {
              if (result.createComment) {
                updateComments(cache, result);
                updatePost(cache, args, info);
              }
            },
            vote: () => { }
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  }
};