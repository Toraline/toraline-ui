import styled from 'styled-components';
import  Checked  from '../../../assets/Icons/toggle-checked.svg';
import LockedChecked  from '../../../assets/Icons/toggle-locked.svg';

export const Container = styled.div<{ title?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;  
  color: ${({ theme }) => theme.colors.grey700};
  gap: 4px;
  width: 78px;
  height: 56px;
  
`;

export const ToggleSwitchWrapper = styled.label`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.purple200};
  border:1px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  height:19px;
  justify-content: center;
  position: relative;
  width: 53px;  
  border: 2px solid ${({ theme }) => theme.colors.purpleSlider};
  
  

  :before {
      content: '';
      position: absolute;
      top:calc(50% - 16px);
      left: -16px;
      width: 32px;
      height: 32px;
      background-repeat: no-repeat;
      background-image: url(${LockedChecked});
      transition:0.5s;
      background-size:32px;
      
    }
    
  `;

  export const Input = styled.input `
    display: none;
    

    :checked + ${ToggleSwitchWrapper}:before {
      content: '';
      position: absolute;
      left: calc(100% - 16px);
      width: 32px;
      height: 32px;
      background-repeat: no-repeat;
      background-image: url(${Checked});     
      transition:0.5s;
      background-size:32px;
    }
    :checked + ${ToggleSwitchWrapper}{
      background-color: ${({ theme }) => theme.colors.green100};
      border: 2px solid ${({ theme }) => theme.colors.greenSlider};   
       
      
    }
  `;
