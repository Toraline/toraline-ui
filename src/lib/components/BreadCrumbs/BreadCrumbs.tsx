import React from 'react';
import { StyledBreadCrumbs } from './BreadCrumbs.styled';

type Crumb = {
  label: string;
  url: string;
}

type BreadCrumbsProps = {
  crumbs: Crumb[];

}


const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ crumbs }) => {
  return (
    <StyledBreadCrumbs aria-label="breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={index} className={index === crumbs.length - 1 ? 'active' : ''}>
            {index !== crumbs.length - 1 ? <a href={crumb.url}>{crumb.label}</a> : crumb.label}
          </li>
        ))}
      </ol>
    </StyledBreadCrumbs>
  );
};

export default BreadCrumbs;