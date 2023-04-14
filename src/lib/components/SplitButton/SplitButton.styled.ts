import styled from 'styled-components';
import { ReactComponent as IconDownload } from '../../../assets/Icons/DownloadIcon.svg';
import { ReactComponent as Show } from '../../../assets/Icons/IconShow.svg';
import { ReactComponent as NotShow } from '../../../assets/Icons/IconNotShow.svg';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 17.5rem;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  border-bottom-left-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
  border: none;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12),
    0px 2px 4px rgba(0, 0, 0, 0.2);
  color: ${({ theme }) => theme.colors.grey100};
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  padding: 1.125rem 1rem;
  width: 13.75rem;

  :hover {
    background-color: ${({ theme }) => theme.colors.purple300};
  }
`;

export const ButtonList = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-bottom-right-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  border: none;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12),
    0px 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
  width: 3.5rem;

  
  

  :hover {
    background-color: ${({ theme }) => theme.colors.purple300};
  }
`;

export const IconShowList = styled(Show)`
  height: 0.8125rem;
  object-position: center;
  transition: transform 0.5s;
  width: 1.25rem;
  
  :active {
    transform: rotate(-180deg);
  }
`;

export const IconNotShowList = styled(NotShow)`
  height: 0.8125rem;
  object-position: center;
  transition: transform 0.5s;
  width: 1.25rem;

  :active {
    transform: rotate(180deg);
  }
`;

export const List = styled.div`
  border-radius: 0.625rem;
  border: none;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12),
    0px 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  max-width: 17.5rem;
  font-weight: 400;
  background-color: ${({ theme }) => theme.colors.grey100};
`;

export const IconImage = styled(IconDownload)`
  height: 1rem;
  width: 1rem;

`;

export const DocumentContainer = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.grey100};
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  font-size: 0.875rem;
  font-weight: 700;
  gap: 1rem;
  height: 0.875rem;
  padding: 1.5rem 1rem;
  text-decoration: none;

  :first-child {
    border-top-left-radius: 0.625rem;
    border-top-right-radius: 0.625rem;
  }

  :last-child {
    border-bottom-left-radius: 0.625rem;
    border-bottom-right-radius: 0.625rem;
  }

  :hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.grey100};

    ${IconImage} path {
      fill: ${({ theme }) => theme.colors.grey100};
    }
  }
`;
