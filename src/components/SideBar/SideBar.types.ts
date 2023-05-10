export type Item = {
    to: string,
    showContent?: React.ReactElement | string,
    content: React.ReactElement | string,
    dropdownItems?: Item[],
    gap?: string,    
}

export type SideBarProps = {
    items: Item[],
    gap?: string,
    footerGap?: string,
    footerItems: Item[],
}
