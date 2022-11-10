import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Box, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
    id: number;
    creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
    id,
    creatorId,
}) => {
    const [{ data: meData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();
    if (meData?.me?.id !== creatorId) {
        return null;
    }

    return (
        <Box>
            <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`} passHref>
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
                        id: id,
                    });
                }}
                variant="ghost"
                aria-label="Delete Post"
                fontSize="24px"
            />
        </Box>
    );
};
