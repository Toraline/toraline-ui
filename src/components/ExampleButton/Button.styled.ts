import styled from 'styled-components';

import { ButtonProps } from './Button.types';

export const ButtonComponent = styled.button<ButtonProps>`
  background-color: ${({ theme: { colors }, isWarning }) => (isWarning ? colors.red : colors.primary)};
  color: ${({ theme }) => theme.colors.white};
`;
