import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<
        "updoot-loading" | "downdoot-loading" | "not-loading"
    >("not-loading");
    const [, vote] = useVoteMutation();

    return (
        <Flex direction="column" alignItems="center" mr={4}>
            <IconButton
                onClick={async () => {
                    setLoadingState("updoot-loading");
                    await vote({ postId: post.id, value: 1 });
                    setLoadingState("not-loading");
                }}
                isLoading={loadingState === "updoot-loading"}
                variant="outline"
                aria-label="Upvote"
                fontSize="24px"
                size="sm"
                icon={<ChevronUpIcon />}
            />
            <Text fontSize={20}>{post.points}</Text>
            <IconButton
                onClick={async () => {
                    setLoadingState("downdoot-loading");
                    await vote({ postId: post.id, value: -1 });
                    setLoadingState("not-loading");
                }}
                isLoading={loadingState === "downdoot-loading"}
                variant="outline"
                aria-label="Downvote"
                fontSize="24px"
                size="sm"
                icon={<ChevronDownIcon />}
            />
        </Flex>
    );
};