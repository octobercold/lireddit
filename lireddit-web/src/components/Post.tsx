import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
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
    userId: number;
}

const Post: React.FC<PostProps> = ({ post, userId }) => {
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
                    {userId !== post.creator.id ? null : (
                        <Box ml="auto">
                            <NextLink
                                href="/post/edit/[id]"
                                as={`/post/edit/${post.id}`}
                                passHref
                            >
                                <IconButton
                                    as={Link}
                                    mr={4}
                                    icon={<EditIcon />}
                                    variant="ghost"
                                    aria-label="Update Post"
                                    fontSize="24px"
                                />
                            </NextLink>

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
                        </Box>
                    )}
                </Flex>
            </Box>
        </Flex>
    );
};

export default Post;
