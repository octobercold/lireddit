import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
    dedupExchange,
    Exchange,
    fetchExchange,
    stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
    VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import { SSRExchange } from "next-urql";
import gql from "graphql-tag";

const errorExchange: Exchange =
    ({ forward }) =>
    (ops$) => {
        return pipe(
            forward(ops$),
            tap(({ error }) => {
                if (error?.message.includes("not authenticated")) {
                    Router.replace("/login");
                }
            })
        );
    };

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        //ugly implementation that works
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);

        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        );

        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

        const isItInTheCache = cache.resolve(
            cache.resolve(entityKey, fieldKey) as string,
            fieldName
        );

        info.partial = !isItInTheCache;

        let hasMore = true;
        const result: string[] = [];
        fieldInfos.forEach((fi) => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, fieldName) as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            result.push(...data);
        });

        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: result,
        };
    };
};

export const createUrqlClient = (ssrExchange: SSRExchange) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                },
            },
            updates: {
                Mutation: {
                    vote: (_result, args, cache) => {
                        const { postId, value } = args as VoteMutationVariables;
                        const data = cache.readFragment(
                            gql`
                                fragment _ on Post {
                                    id
                                    points
                                }
                            `,
                            { id: postId } as any
                        );
                        if (data) {
                            const newPoints = data.points + value;
                            cache.writeFragment(
                                gql`
                                    fragment __ on Post {
                                        id
                                        points
                                    }
                                `,
                                { id: postId, points: newPoints }
                            );
                        }
                    },
                    createPost: (_result, _args, cache) => {
                        const allFields = cache.inspectFields("Query");
                        const fieldInfos = allFields.filter(
                            (info) => info.fieldName === "posts"
                        );
                        fieldInfos.forEach((fi) => {
                            cache.invalidate("Query", "posts", fi.arguments);
                        });
                        cache.invalidate("Query", "posts", {
                            limit: 15,
                        });
                    },
                    logout: (_result, _args, cache) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({ me: null })
                        );
                    },
                    login: (_result, _args, cache) => {
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
                    },
                    register: (_result, _args, cache) => {
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
                },
            },
        }),
        errorExchange,
        ssrExchange,
        fetchExchange,
    ],
});
