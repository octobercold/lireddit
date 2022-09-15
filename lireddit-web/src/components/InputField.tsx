import {
    FormControl,
    FormErrorMessage,
    FormLabel,
} from "@chakra-ui/form-control";
import { Input, Textarea } from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputOrTextareaProps = InputHTMLAttributes<
    HTMLInputElement | HTMLTextAreaElement
> & {
    label: string;
    name: string;
    textarea?: boolean;
};

const InputField: React.FC<InputOrTextareaProps> = ({
    label,
    textarea,
    size: _,
    ...props
}) => {
    let InputOrTextarea;
    if (textarea) {
        InputOrTextarea = Textarea;
    } else {
        InputOrTextarea = Input;
    }
    const [field, { error }] = useField(props);
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextarea {...field} {...props} id={field.name} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

export default InputField;
