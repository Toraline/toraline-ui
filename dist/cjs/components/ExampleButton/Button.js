"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
const Button_styled_1 = require("./Button.styled");
const Button = ({ children, isWarning }) => {
    return react_1.default.createElement(Button_styled_1.ButtonComponent, { isWarning: isWarning }, children);
};
exports.Button = Button;
//# sourceMappingURL=Button.js.map