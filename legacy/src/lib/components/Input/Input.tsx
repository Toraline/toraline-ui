import React from "react";
import {Container, FieldContainer, Label, Field, Icon, MessageError} from './Input.styled'

type InputTypes = {
  disabled?: boolean;
  label?: string;
  name: string;
  error?: string;
  id: string;
  value?: string;
};

const Input: React.FC<InputTypes> = ({disabled, label, name, error, id, value}) => (
  <Container>
    <FieldContainer>
      <Field
        disabled={disabled}
        name={name}
        error={error}
        placeholder={label}
        id={id}
        value={value}
        />
      <Label htmlFor={id}>
        {label}
      </Label>
    </FieldContainer>
    {error && (
      <MessageError>
        <Icon /> {error}
      </MessageError>
    )}
  </Container>
);

export default Input;
