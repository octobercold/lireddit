import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

export const Post: React.FC = () => {
    const [{ data, error, fetching }] = useGetPostFromUrl();
    if (fetching) {
        return (
            <Layout>
                <Box>loading....</Box>
            </Layout>
        );
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Heading mb={4}>{data.post.title}</Heading>
            <Box>{data.post.text}</Box>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
