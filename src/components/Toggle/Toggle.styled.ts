import styled from 'styled-components';
import Checked from '../../assets/icons/';
import LockedChecked from '../../assets/Icons/ToggleLocked.svg';

export const Container = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.colors.grey700};
  display: flex;
  gap: 0.25rem;
  height: 3.5rem;
  width: 4.875rem;
`;

export const ToggleSwitchWrapper = styled.label`
  background-color: ${({ theme }) => theme.colors.purple200};
  border-radius: 1.875rem;
  border: 0.125rem solid ${({ theme }) => theme.colors.purpleSlider};
  display: flex;
  height: 1.25rem;
  position: relative;
  width: 3.375rem;

  :before {
    background-image: url(${LockedChecked});
    background-repeat: no-repeat;
    background-size: 2rem;
    content: '';
    height: 2rem;
    left: -1rem;
    position: absolute;
    top: calc(50% - 1rem);
    transition: 0.5s;
    width: 2rem;
  }
`;

export const Input = styled.input`
  display: none;
  :checked + ${ToggleSwitchWrapper}:before {
    background-image: url(${Checked});
    background-repeat: no-repeat;
    height: 2rem;
    left: calc(100% - 1rem);
    position: absolute;
    transition: 0.5s;
  }
  :checked + ${ToggleSwitchWrapper} {
    background-color: ${({ theme }) => theme.colors.green100};
    border: 0.125rem solid ${({ theme }) => theme.colors.greenSlider};
  }
`;
