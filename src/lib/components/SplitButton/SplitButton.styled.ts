import styled from 'styled-components';
import { ReactComponent as Show } from '../../../assets/Icons/IconShow.svg';
import { ReactComponent as NotShow } from '../../../assets/Icons/IconNotShow.svg';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 4px;
`;

export const Button = styled.button`
  border-bottom-left-radius: 8px;
  border-top-left-radius: 8px;
  padding: 18px 16px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.grey100};
  font-size: 18px;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12),
    0px 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.colors.purple300};
  }
`;

export const ButtonList = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-right-radius: 8px;
  border-top-right-radius: 8px;
  padding: 24px 16px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12),
    0px 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  :hover {
    background-color: ${({ theme }) => theme.colors.purple300};
  }
`;

export const IconShowList = styled(Show)`
  height: 0.8125rem;
  object-position: center;
  width: 1.25rem;
`;

export const IconNotShowList = styled(NotShow)`
  height: 0.8125rem;
  object-position: center;
  width: 1.25rem;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  min-width: 17.25rem;
  height: auto;
  background-color: ${({ theme }) => theme.colors.grey100};
  border-radius: 10px;
  border: none;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12),
    0px 2px 4px rgba(0, 0, 0, 0.2);
  padding: 16px;
`;
