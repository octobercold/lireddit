import { DeleteIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import React from "react";
import {
    PostSnippetFragment,
    useDeletePostMutation,
} from "../generated/graphql";
import { UpdootSection } from "./UpdootSection";
import NextLink from "next/link";

interface PostProps {
    post: PostSnippetFragment;
}

const Post: React.FC<PostProps> = ({ post }) => {
    const [{ fetching: deletePostFetching }, deletePost] =
        useDeletePostMutation();

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
                    <IconButton
                        ml="auto"
                        icon={<DeleteIcon />}
                        onClick={async () => {
                            await deletePost({
                                id: post.id,
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
    );
};

export default Post;
