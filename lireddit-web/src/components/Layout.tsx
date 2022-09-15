import React from "react";
import NavBar from "./NavBar";
import Wrapper, { WrapperProps } from "./Wrapper";

export const Layout: React.FC<WrapperProps> = ({ variant, children }) => {
    return (
        <>
            <NavBar />
            <Wrapper variant={variant}>{children}</Wrapper>
        </>
    );
};
