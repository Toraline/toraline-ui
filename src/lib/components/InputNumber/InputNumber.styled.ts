import styled from 'styled-components';
import { ReactComponent as Minus } from '../../../assets/Icons/Minus.svg';
import { ReactComponent as Plus } from '../../../assets/Icons/Plus.svg';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  gap: 8px;
`;

export const Input = styled.input<{unit?: string}>`
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  font-family: inherit;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.75rem;
  padding: 0 0.25rem;
  text-align: center;
  width: 5.1875rem;
  height: 2.25rem;

  ${({ unit, theme }) => unit && `
    content: ${unit};
    color: ${theme.colors.grey900};
  `}
 
  ::-webkit-inner-spin-button {
    display: none;
  }
  :focus-visible {
    outline: none;  
  }
`;

export const Button = styled.button`
  border: none;
  background-color: transparent;

  :hover {
    cursor: pointer;
  }
`;

export const MinusIcon = styled(Minus)`
  width: 24px;
  height: 24px;
`;

export const PlusIcon = styled(Plus)`
  width: 24px;
  height: 24px;
`;
