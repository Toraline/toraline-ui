import React from 'react';
import { Container, Input, Button, MinusIcon, PlusIcon } from './InputNumber.styled';

type InputNumberTypes = {
  value: number;
  setValue: (value: number) => void;
  unit?: string;
};

const InputNumber: React.FC<InputNumberTypes> = ({ value, setValue, unit }) => (
  <Container>
    <Button
      type='button'
      onClick={() => {
        if (value >= 1) {
          setValue(value - 1);
        } else {
          setValue(value + 0);
        }
      }}
    >
      <MinusIcon />
    </Button>
    <Input
      value={value}
      unit={unit}
      type='number'
      onChange={(e) => {
        setValue(Number(e.target.value));
      }}
      max='100'
      min='1'
    />
    <Button
      type='button'
      onClick={() => {
        setValue(value + 1);
      }}
    >
      <PlusIcon />
    </Button>
  </Container>
);

export default InputNumber;
