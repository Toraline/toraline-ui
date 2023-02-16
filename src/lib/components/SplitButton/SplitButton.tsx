import React from 'react';
import { ButtonRow, Button, ButtonList, IconShowList, IconNotShowList, List, Container } from './SplitButton.styled';

type SplitButtonTypes = {
  value: string;
};

const SplitButton: React.FC<SplitButtonTypes> = ({value}) => {
  const [show, setShow] = React.useState(false);

  return (
    <Container>
      <ButtonRow>
        <Button type='button'>{value}</Button>
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
            <div>
              <img src='' alt='' />
              <a href='www.google.com'>Doc 1</a>
            </div>
            <div>
              <img src='' alt='' />
              <a href='www.google.com'>Doc 2</a>
            </div>
            <div>
              <img src='' alt='' />
              <a href='www.google.com'>Doc 3</a>
            </div>
          </List>
        )}
    </Container>
  );
};

export default SplitButton;
