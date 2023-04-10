import styled from 'styled-components';

export const Container = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  font-size: 1.25rem;
  font-weight: 700;
`;

export const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const ListItem = styled.li<{ isActive: boolean }>`
  display: inline-block;
  margin-right: 0.3125rem;

  &:not(:last-child)::after {
    content: '/';
  }

  ${({ isActive }) => isActive && 'font-size: 1.5rem;'}
`;

export const Link = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.grey700};
  }
`;
