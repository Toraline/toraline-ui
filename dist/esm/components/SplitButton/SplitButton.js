import React from 'react';
import { Arrow, ButtonRow, Button, ButtonList, List, Container, DocumentContainer } from './SplitButton.styled';
export const SplitButton = ({ mainButtonText, onClickMainButton, dropdownOptions }) => {
    const [show, setShow] = React.useState(false);
    return (React.createElement(Container, null,
        React.createElement(ButtonRow, null,
            React.createElement(Button, { onClick: onClickMainButton, type: "button" }, mainButtonText),
            React.createElement(ButtonList, { onClick: () => setShow(!show), type: "button" },
                React.createElement(Arrow, { isOpen: show }))),
        show && (React.createElement(List, null, dropdownOptions === null || dropdownOptions === void 0 ? void 0 : dropdownOptions.map(({ onClick, text, Icon }) => (React.createElement(DocumentContainer, { onClick: onClick }, text)))))));
};
//# sourceMappingURL=SplitButton.js.map