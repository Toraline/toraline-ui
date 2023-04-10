import React from 'react';

import { Container, List, ListItem, Link } from './Breadcrumbs.styled';
import { BreadcrumbsProps, Crumb } from './Breadcrumbs.types';

export const Breadcrumbs = ({ crumbs }: BreadcrumbsProps): JSX.Element => (
  <Container>
    <List>
      {crumbs.map((crumb: Crumb, index: number) => {
        const isActive = index === crumbs.length - 1;
        return (
          <ListItem key={index} isActive={isActive}>
            {!isActive ? <Link href={crumb.url}>{crumb.label}</Link> : crumb.label}
          </ListItem>
        );
      })}
    </List>
  </Container>
);
