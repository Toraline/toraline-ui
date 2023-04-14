export type Crumb = {
  label: string;
  url: string;
};

export type BreadcrumbsProps = {
  crumbs: Crumb[];
};
