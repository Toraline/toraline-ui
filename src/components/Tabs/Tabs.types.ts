export type TabProps = {
  label: string;
  id: string;
  component: React.ReactNode;
  isActive: boolean;
};

export type TabsProps = {
  tabs: TabProps[];
};
