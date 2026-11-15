import React from 'react';
import { ButtonRow, Button, ButtonList, IconShowList, IconNotShowList, List, Container, IconImage, DocumentContainer } from './SplitButton.styled';



export type DropdownButtons = Array<{ 
  onClick: () => void;
  text: string;
  Icon?: React.ReactNode; 
}>;

type SplitButtonTypes = {
  onClickMainButton: () => void;
  mainButtonText: string;
  dropdownButtons?: DropdownButtons;
};

const SplitButton: React.FC<SplitButtonTypes> = ({ mainButtonText, onClickMainButton, dropdownButtons }) => {
  const [show, setShow] = React.useState(false);

  return (
    <Container>
      <ButtonRow>
        <Button onClick={onClickMainButton} type='button'>{mainButtonText}</Button>
        <ButtonList onClick={() => setShow(!show)} type='button'>
          {show ? (
            <IconNotShowList role='img' aria-label='Icon of not show the list' />
          ) : (
            <IconShowList role='img' aria-label='Icon of show the list' />
          )}
        </ButtonList>
      </ButtonRow>
      {show && (
        <List>
          {dropdownButtons?.map(({onClick, text, Icon}) => (
            <DocumentContainer onClick={onClick}>
              { Icon? Icon : <IconImage /> }
              {text}
            </DocumentContainer>
          ))}
        </List>
      )}
    </Container>
  );
};

export default SplitButton;
