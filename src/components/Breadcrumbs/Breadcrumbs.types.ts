export type Crumb = {
  label: string;
  url: string;
  id: number;
};

export type BreadcrumbsProps = {
  crumbs: Crumb[];
};
