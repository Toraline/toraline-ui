import React from 'react';

import { Container, FieldContainer, Label, Field, MessageError } from './Input.styled';
import { InputProps } from './Input.types';

export const Input = ({ disabled, label, name, error, id, value }: InputProps) => (
  <Container>
    <FieldContainer>
      <Field disabled={disabled} name={name} error={error} placeholder={label} id={id} value={value} />
      <Label htmlFor={id}>{label}</Label>
    </FieldContainer>
    {error && <MessageError>{error}</MessageError>}
  </Container>
);
