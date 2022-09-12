import React from "react";
import { Formik, Form } from "formik";
import Wrapper from "../../components/Wrapper";
import InputField from "../../components/InputField";
import { Button } from "@chakra-ui/react";
import { NextPage } from "next";

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    // const response = await login(values);
                    // if (response.data?.login.errors?.length) {
                    //     setErrors(toErrorMap(response.data.login.errors));
                    // } else if (response.data?.login.user) {
                    //     router.push("/");
                    // }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="newPassword"
                            placeholder="new password"
                            label="New Password"
                            type="password"
                        />
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            change password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string,
    };
};

export default ChangePassword;
