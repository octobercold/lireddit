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

export type MergeMode = "before" | "after";

export interface PaginationParams {
    cursorArgument?: string;
}

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        );
        console.log("allFields: ", allFields);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }
        console.log("fieldArgs: ", fieldArgs);
        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        console.log("key i created: ", fieldKey);
        const isInCache = cache.resolve(entityKey, fieldKey);
        console.log("isInCache: ", isInCache);
        info.partial = !!isInCache;

        const results: string[] = [];
        fieldInfos.forEach((fi) => {
            const data = cache.resolve(entityKey, fi.fieldKey) as string[];
            results.push(...data);
        });

        return results;
        //     const visited = new Set();
        //     let result: NullArray<string> = [];
        //     let prevOffset: number | null = null;

        //     for (let i = 0; i < size; i++) {
        //         const { fieldKey, arguments: args } = fieldInfos[i];
        //         if (args === null || !compareArgs(fieldArgs, args)) {
        //             continue;
        //         }

        //         const links = cache.resolve(entityKey, fieldKey) as string[];
        //         const currentOffset = args[cursorArgument];

        //         if (
        //             links === null ||
        //             links.length === 0 ||
        //             typeof currentOffset !== "number"
        //         ) {
        //             continue;
        //         }

        //         const tempResult: NullArray<string> = [];

        //         for (let j = 0; j < links.length; j++) {
        //             const link = links[j];
        //             if (visited.has(link)) continue;
        //             tempResult.push(link);
        //             visited.add(link);
        //         }

        //         if (
        //             (!prevOffset || currentOffset > prevOffset) ===
        //             (mergeMode === "after")
        //         ) {
        //             result = [...result, ...tempResult];
        //         } else {
        //             result = [...tempResult, ...result];
        //         }

        //         prevOffset = currentOffset;
        //     }

        //     const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        //     if (hasCurrentPage) {
        //         return result;
        //     } else if (!(info as any).store.schema) {
        //         return undefined;
        //     } else {
        //         info.partial = true;
        //         return result;
        //     }
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
