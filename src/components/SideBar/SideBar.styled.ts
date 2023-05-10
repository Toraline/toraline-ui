import styled from 'styled-components';

export const Nav = styled.nav`
    background-color: ${({ theme }) => theme.colors.purple300};
    display: flex;
    flex-direction: column;
    gap: 11.875rem;
    height: 100%;
    justify-content: space-between;
    padding: 4rem 1.375rem 2rem 1.375rem;
    position: relative;
    width: max-content;
`;

export const Text = styled.p`
    color: white;
    font-weight: 700;
    margin: 0;
`;

export const OpenButton = styled.button`
    background-color: ${({ theme }) => theme.colors.grey300};
    border-radius: 0.5rem;
    border-style: none;
    box-shadow: 0rem 0.125rem 0.0625rem rgba(0, 0, 0, 0.04), 0rem 0.0625rem 0.3125rem rgba(0, 0, 0, 0.12);
    cursor: pointer;
    height: 2.25rem;
    position: absolute;
    right: -1.125rem;
    top: calc(50% - 1.125rem);
    transform: rotate(45deg);
    width: 2.25rem;
`;

export const DropdownButton = styled.span`
    border-style: none;
    cursor: pointer;
    display: inline-block;
    transition: transform .2s;
`;

export const List = styled.ul<{gap?: string}>`
    display: flex;
    flex-direction: column;
    gap: ${({gap})=> gap || '3rem'};
    list-style: none;
    margin-top: 0.75rem;
    margin: 0;
    padding: 0;
`;

export const ListItem = styled.li`
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
`;

export const Link = styled.a`
    :hover {
        opacity: .8;
    };
    align-items: center;
    display: flex;
    gap: 0.5rem;
    text-decoration: none;
`;

export const Details = styled.details`
    &[open] ${DropdownButton} {
        transform: rotate(180deg);
    };
    ${ListItem} {
        font-size: 0.75rem;
    };
`;

export const Summary = styled.summary`
    :hover {
        opacity: .8;
    };
    align-items: center;
    display: flex;
    gap: 0.5rem;    
    justify-content: left;
    padding-left: 0;
`;

export const ShowContent = styled.span`
    color:black;
    display: inline-block;
    height: 1.5rem;
    width: 1.5rem;
`;
