import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { simplePagination } from "@urql/exchange-graphcache/extras";
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
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import { SSRExchange } from "next-urql";

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

        // better implementation that doesn't work for some reason
        // const data = cache.resolve(parentFieldKey, fieldName) as string[];
        // const hasMore = cache.resolve(parentFieldKey, "hasMore");

        // info.partial = !data;

        // results = [...results, ...data];
        // console.log("data: ", data);
        // console.log("results: ", results);

        // return {
        //     __typename: "PaginatedPosts",
        //     hasMore,
        //     posts: results,
        // };
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
                    logout: (_result, args, cache, info) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({ me: null })
                        );
                    },
                    login: (_result, args, cache, info) => {
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
                    register: (_result, args, cache, info) => {
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
