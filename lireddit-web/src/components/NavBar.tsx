import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

const NavBar: React.FC = () => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery();

    let body = null;

    // useEffect(() => {
    //     if (!hasMounted && !fetching && !data.me) {
    //         setHasMounted(true);
    //         resendMeQuery({ requestPolicy: "network-only" });
    //     }
    // }, [hasMounted, resendMeQuery, fetching, data]);
    if (fetching) {
        return body;
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link mr={2}>register</Link>
                </NextLink>
            </>
        );
    } else if (data?.me) {
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={() => {
                        logout({});
                    }}
                    isLoading={logoutFetching}
                    variant="link"
                >
                    logout
                </Button>
            </Flex>
        );
    }

    return (
        <Flex
            zIndex={1}
            position="sticky"
            top={0}
            bg="tan"
            p={4}
            align="center"
        >
            <NextLink href="/" passHref>
                <Link>
                    <Heading>LiReddit</Heading>
                </Link>
            </NextLink>
            <Box ml={"auto"}>{body}</Box>
        </Flex>
    );
};

export default NavBar;
