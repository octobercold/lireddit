import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { PostSnippetFragment } from "../generated/graphql";
import { EditDeletePostButtons } from "./EditDeletePostButtons";
import { UpdootSection } from "./UpdootSection";

interface PostProps {
    post: PostSnippetFragment;
    userId: number;
}

const Post: React.FC<PostProps> = ({ post }) => {
    return (
        <Flex p={5} shadow="md" borderWidth="1px">
            <UpdootSection post={post} />
            <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${post.id}`} passHref>
                    <Link>
                        <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                </NextLink>
                <Text>posted by {post.creator.username}</Text>
                <Flex>
                    <Text flex={1} mt={4}>
                        {post.textSnippet}
                    </Text>
                    <Box ml="auto">
                        <EditDeletePostButtons
                            id={post.id}
                            creatorId={post.creator.id}
                        />
                    </Box>
                </Flex>
            </Box>
        </Flex>
    );
};

export default Post;
