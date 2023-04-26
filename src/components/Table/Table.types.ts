export type TableProps = {
  tableHeader: {
    label: string;
    key: string;
    alignment?: string;
  }[];
  tableRows: {
    cells: {
      key: string;
      component: React.ReactNode;
      alignment?: string;
      id?: string;
    }[];
  }[];
};
