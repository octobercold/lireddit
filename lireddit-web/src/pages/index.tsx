import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Button, Flex, Heading, Stack } from "@chakra-ui/react";

import { useState } from "react";
import Post from "../components/Post";

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 15,
        cursor: null,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });
    const [{ data: meData }] = useMeQuery();

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
                                <Post
                                    key={p.id}
                                    post={p}
                                    userId={meData.me.id}
                                ></Post>
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
