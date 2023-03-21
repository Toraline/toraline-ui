export type DropdownOptions = Array<{
    onClick: () => void;
    text: string;
    Icon?: React.ReactNode;
}>;
export type SplitButtonProps = {
    onClickMainButton: () => void;
    mainButtonText: string;
    dropdownOptions?: DropdownOptions;
};
