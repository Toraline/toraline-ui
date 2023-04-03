import styled from 'styled-components'

export const TableStyle = styled.ul`
    display:flex;
    flex-direction: column;
    font-family: 'Montserrat', sans-serif;
    gap: 0.5rem;
`;

export const Text = styled.p`
    font-size: 1rem;
    padding-left: 3rem;
`;

export const TableHeader = styled.div<{alignment?: string}>`
    align-items: center;
    background-color: ${({ theme }) => theme.colors.purple300};
    border-radius: 0.625rem;
    color: #ffff;
    display: flex;
    height: 2rem;
    justify-content: ${({ alignment }) => alignment || 'start'};
`;

export const TableRowHeader = styled.li<{length: number}>`
    background-color: #833CDA;
    border-radius: 0.625rem;    
    display: grid;
    font-weight: 700;    
    grid-template-columns: repeat(${({length}) => length},1fr);
    justify-items: start;
`;
        
export const TableRowBody = styled.li<{length: number}>`
    align-items: center;
    border-radius: 0.625rem;
    border: 0.0625rem solid #9FA3A9;    
    display: grid;
    font-weight: 400;
    grid-template-columns: repeat(${({length}) => length},1fr);
    height: 4rem;
`;

export const TableCell = styled.div<{alignment?: string}>`
    font-size: 1rem;
    justify-content: ${({ alignment }) => alignment || 'start'};
    padding-left: 3rem;
    display: flex;
`;