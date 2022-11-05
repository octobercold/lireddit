import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostsQuery, useDeletePostMutation } from "../generated/graphql";
import { Layout } from "../components/Layout";
import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Link,
    Stack,
    Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { UpdootSection } from "../components/UpdootSection";
import { DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 15,
        cursor: null,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });
    const [{ fetching: deletePostFetching }, deletePost] =
        useDeletePostMutation();

    if (!fetching && !data) {
        return <div>query failed or there is no data to display</div>;
    }

    return (
        <Layout>
            <>
                <Heading>Fake Reddit</Heading>
                {!data && fetching ? (
                    <div>loading...</div>
                ) : (
                    <Stack spacing={8}>
                        {data.posts.posts.map((p) =>
                            !p ? null : (
                                <Flex
                                    key={p.id}
                                    p={5}
                                    shadow="md"
                                    borderWidth="1px"
                                >
                                    <UpdootSection post={p} />
                                    <Box flex={1}>
                                        <NextLink
                                            href="/post/[id]"
                                            as={`/post/${p.id}`}
                                            passHref
                                        >
                                            <Link>
                                                <Heading fontSize="xl">
                                                    {p.title}
                                                </Heading>
                                            </Link>
                                        </NextLink>
                                        <Text>
                                            posted by {p.creator.username}
                                        </Text>
                                        <Flex>
                                            <Text flex={1} mt={4}>
                                                {p.textSnippet}
                                            </Text>
                                            <IconButton
                                                ml="auto"
                                                icon={<DeleteIcon />}
                                                onClick={async () => {
                                                    await deletePost({
                                                        id: p.id,
                                                    });
                                                }}
                                                isLoading={deletePostFetching}
                                                variant="ghost"
                                                aria-label="Delete Post"
                                                fontSize="24px"
                                            />
                                        </Flex>
                                    </Box>
                                </Flex>
                            )
                        )}
                    </Stack>
                )}
                {data && data.posts.hasMore ? (
                    <Flex>
                        <Button
                            onClick={() =>
                                setVariables({
                                    limit: variables.limit,
                                    cursor: data.posts.posts[
                                        data.posts.posts.length - 1
                                    ].createdAt,
                                })
                            }
                            isLoading={fetching}
                            m="auto"
                            my={8}
                        >
                            load more
                        </Button>
                    </Flex>
                ) : null}
            </>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
