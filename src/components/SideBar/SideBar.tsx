import React from 'react';
import { Nav, Text, OpenButton, DropdownButton, List, ListItem, Link, Details, Summary, ShowContent } from './SideBar.styled';
import { Item, SideBarProps } from './SideBar.types';

export const SideBar = (props:SideBarProps) => {
    const [isOpen, setIsOpen] = React.useState(true)
    return (
        <Nav>
            <OpenButton type='button' onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '🡿' : '🡽'}
            </OpenButton> 
            <List gap={props.gap}>
                {props.items.map((item)=>(
                    <ListItem>
                        {item.dropdownItems?.length ? (
                        <Details>                    
                            <Summary>
                                <ShowContent>{item.showContent}</ShowContent>
                                {isOpen && <Text>{item.content} <DropdownButton>🡻</DropdownButton></Text>}
                            </Summary>
                                {isOpen && 
                                    <List gap={item.gap}>
                                        {item.dropdownItems.map((dropdownItem)=>(
                                            <ListItem>
                                                <Link href={dropdownItem.to}>
                                                    <Text>{dropdownItem.content}</Text>
                                                </Link>
                                            </ListItem>
                                        ))}                                        
                                    </List>
                                }
                        </Details>                            
                        ) : ( 
                            <Link href={item.to}>
                                <ShowContent>{item.showContent}</ShowContent>
                                {isOpen && <Text>{item.content}</Text>}
                            </Link>
                        )}
                    </ListItem>
                ))}
            </List>
            <List gap={props.footerGap}>
                {props.footerItems.map((footerItem)=>(
                    <ListItem>
                        <Link href={footerItem.to}>
                            <ShowContent>{footerItem.showContent}</ShowContent>
                            {isOpen && <Text>{footerItem.content}</Text>}
                        </Link>
                    </ListItem>
                ))}
            </List>
        </Nav>
    )
}


