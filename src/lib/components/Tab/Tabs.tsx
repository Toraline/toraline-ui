import React from "react";
import {Tab, TabsWrapper} from './Tabs.styled'

type TabProps = {
  label: string, 
  id: string, 
  component: React.ReactNode, 
  isActive: boolean
};

type TabsProps = {
  tabs: TabProps[]
}

const Tabs = ({ tabs }:TabsProps): JSX.Element => {
  const initialActiveTab = tabs.find((tab) => tab.isActive)
  const [currentActiveTab, setCurrentActiveTab] = React.useState(initialActiveTab);

  return (
  <div>
    <TabsWrapper>
      {tabs.map((tab) => {
        const isCurrentActiveTab = currentActiveTab?.id === tab.id
        return (
          <Tab type='button' isActive={isCurrentActiveTab} onClick={() => setCurrentActiveTab(tab)}>
            {tab.label}
          </Tab>
        )
      })}
    </TabsWrapper>
    <div>
      {currentActiveTab?.component}
    </div>
  </div>
);
}

export default Tabs;
