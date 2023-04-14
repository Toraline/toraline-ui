import styled from 'styled-components'

export const TabsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-bottom: 0.25rem;
  position: relative;

  :before{
    background-color: ${({ theme }) => theme.colors.purple200};
    border-radius:  0.25rem;
    bottom: 0;
    content: '';
    height:  0.25rem;
    left: 0;
    position: absolute;
    right: 0;
    width: 100%;
  }
`;

export const Tab = styled.button<{isActive: boolean}>`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.grey900};
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size:  1.25rem;
  font-weight: 700;
  line-height:  1.5rem;
  padding: 0;
  padding: 0.5rem 2.125rem;
  position: relative;

  ${({isActive, theme}) => isActive && `
    :before{
      background-color: ${theme.colors.primary};
      border-radius:  0.25rem;
      bottom: -0.4375rem;
      content: '';
      height:  0.75rem;
      left: 0;
      position: absolute;
      right: 0;
      width: 100%;
    }
  `}
`;
