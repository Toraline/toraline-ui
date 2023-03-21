"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonComponent = void 0;
const styled_components_1 = __importDefault(require("styled-components"));
exports.ButtonComponent = styled_components_1.default.button `
  background-color: ${({ theme: { colors }, isWarning }) => (isWarning ? colors.red : colors.primary)};
  color: ${({ theme }) => theme.colors.white};
`;
//# sourceMappingURL=Button.styled.js.map