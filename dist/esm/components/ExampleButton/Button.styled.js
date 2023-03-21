import styled from 'styled-components';
export const ButtonComponent = styled.button `
  background-color: ${({ theme: { colors }, isWarning }) => (isWarning ? colors.red : colors.primary)};
  color: ${({ theme }) => theme.colors.white};
`;
//# sourceMappingURL=Button.styled.js.map