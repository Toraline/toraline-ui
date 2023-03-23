import styled from 'styled-components';
import  Checked  from '../../../assets/Icons/toggle-checked.svg';
import LockedChecked  from '../../../assets/Icons/toggle-locked.svg';

export const ToggleSwitchWrapper = styled.label`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.purple200};
  border:1px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  height:12px;
  justify-content: center;
  position: relative;
  width: 32px;  

  :before {
      content: '';
      position: absolute;
      top:calc(50% - 10px);
      left: -25%;
      width: 20px;
      height: 20px;
      background-image: url(${LockedChecked});
      transition: 0.50s;
      
    }
    
  `;

  export const Input = styled.input `
    display: none;

    :checked + ${ToggleSwitchWrapper}:before {
      content: '';
      position: absolute;
      top:calc(50% - 10px);
      left: 50%;
      width: 20px;
      height: 20px;
      background-image: url(${Checked});     
      transition: 0.50s;
    }
    :checked + ${ToggleSwitchWrapper}{
      background-color: #7EC36D;
      
    }
  `;
