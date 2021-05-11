import React, {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  useEffect,
} from "react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { useField } from "formik";
import { Textarea } from "@chakra-ui/textarea";
import { Input } from "@chakra-ui/input";
import { isServer } from "../../utils/isServer";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    name: string;
    textarea?: boolean;
    marginsLabel?: string;
    [key: string]: any;
  };

const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  marginsLabel,
  ...props
}) => {
  let InputOrTextarea = null;

  if (textarea) InputOrTextarea = Textarea;
  else InputOrTextarea = Input;

  const [field, { error, touched }] = useField(props);

  useEffect(() => {
    if (!isServer()) {
      const textArea = document.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      if (textArea && textArea.clientHeight < textArea.scrollHeight) {
        textArea.style.height = "auto";
        textArea.style.height = textArea.scrollHeight + 4 + "px";
      }
    }
  }, []);

  return (
    <FormControl isInvalid={!!(error && touched)}>
      <FormLabel htmlFor={field.name} m={marginsLabel ? marginsLabel : "0"}>
        {label}
      </FormLabel>
      <InputOrTextarea
        bg="white"
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      {error ? (
        <FormErrorMessage position="absolute" mt="3px" fontSize="md">
          {error && touched ? error : null}
        </FormErrorMessage>
      ) : null}
    </FormControl>
  );
};

export default InputField;
