import React from 'react';

import { Arrow, ButtonRow, Button, ButtonList, List, Container, DocumentContainer } from './SplitButton.styled';
import { SplitButtonProps } from './SplitButton.types';

export const SplitButton = ({ mainButtonText, onClickMainButton, dropdownOptions }: SplitButtonProps): JSX.Element => {
  const [show, setShow] = React.useState(false);

  return (
    <Container>
      <ButtonRow>
        <Button onClick={onClickMainButton} type="button">
          {mainButtonText}
        </Button>
        <ButtonList onClick={() => setShow(!show)} type="button">
          <Arrow isOpen={show} />
        </ButtonList>
      </ButtonRow>
      {show && (
        <List>
          {dropdownOptions?.map(({ onClick, text, Icon }) => (
            <DocumentContainer onClick={onClick}>{text}</DocumentContainer>
          ))}
        </List>
      )}
    </Container>
  );
};
