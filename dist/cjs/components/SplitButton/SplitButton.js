"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitButton = void 0;
const react_1 = __importDefault(require("react"));
const SplitButton_styled_1 = require("./SplitButton.styled");
const SplitButton = ({ mainButtonText, onClickMainButton, dropdownOptions }) => {
    const [show, setShow] = react_1.default.useState(false);
    return (react_1.default.createElement(SplitButton_styled_1.Container, null,
        react_1.default.createElement(SplitButton_styled_1.ButtonRow, null,
            react_1.default.createElement(SplitButton_styled_1.Button, { onClick: onClickMainButton, type: "button" }, mainButtonText),
            react_1.default.createElement(SplitButton_styled_1.ButtonList, { onClick: () => setShow(!show), type: "button" },
                react_1.default.createElement(SplitButton_styled_1.Arrow, { isOpen: show }))),
        show && (react_1.default.createElement(SplitButton_styled_1.List, null, dropdownOptions === null || dropdownOptions === void 0 ? void 0 : dropdownOptions.map(({ onClick, text, Icon }) => (react_1.default.createElement(SplitButton_styled_1.DocumentContainer, { onClick: onClick }, text)))))));
};
exports.SplitButton = SplitButton;
//# sourceMappingURL=SplitButton.js.map