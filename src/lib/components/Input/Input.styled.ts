import styled from 'styled-components'
import { ReactComponent as Logo } from '../../../assets/Icons/Error.svg'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: 'Montserrat', sans-serif;
`;

export const FieldContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const Label = styled.label`
  color: ${({ theme }) => theme.colors.grey500};
  font-size: 0.875rem;
  font-weight: 400;
  left: 0.75rem;
  padding: 0 0.125rem;
  position: absolute;
  top: calc(50% - 0.6rem);
  transition: transform 0.2s, font-weigth 0.2s, background-color 0.2s;
`;

export const Field = styled.input<{ error?: string }>`
  border-radius: 0.5rem;
  border: 0.0625rem solid
    ${({ theme, disabled }) => (disabled ? theme.colors.grey200 : theme.colors.grey500)};
  border: 0.0625rem solid ${({ error, theme }) => error && theme.colors.red};
  color: ${({ theme }) => theme.colors.grey500};
  cursor: text;
  padding: 1rem 0.75rem;
  width: 100%;
  ${({ disabled }) => disabled && 'pointer-events: none;'};
  ${({ disabled, theme }) => disabled && `background-color: ${theme.colors.grey200}`};

  :hover {
    border: 0.0625rem solid ${({ theme }) => theme.colors.grey700};
    border: 0.0625rem solid ${({ error, theme }) => error && theme.colors.red};
  }

  :focus {
    border: 0.0625rem solid ${({ error, theme }) => error? theme.colors.red : theme.colors.primary};
    color: ${({ theme }) => theme.colors.grey900};
    outline: 0;
    + ${Label} {
      background-color: ${({ theme }) => theme.colors.grey100};
      font-weight: 500;
      transform: translateY(-1.5625rem) scale(0.9);
    }
  }

  :not(:placeholder-shown) {
    + ${Label} {
      background-color: ${({ theme }) => theme.colors.grey100};
      font-weight: 500;
      transform: translateY(-1.5625rem) scale(0.9);
    }
  }

  ::placeholder {
    opacity: 0;
  }
`;

export const MessageError = styled.p`
  color: ${({ theme }) => theme.colors.grey500};
  display: flex;
  font-size: 0.75rem;
  gap: 0.25rem;
`;

export const Icon = styled(Logo)`
  height: 0.875rem;
  object-fit: contain;
  width: 0.875rem;
`;

