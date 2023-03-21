"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitButton = void 0;
const SplitButton_1 = require("./SplitButton");
const meta = {
    title: 'Button',
    component: SplitButton_1.SplitButton,
    args: {
        mainButtonText: 'Main button',
        dropdownOptions: [
            {
                onClick: () => { },
                text: 'Option 1',
            },
        ],
    },
};
exports.default = meta;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
exports.SplitButton = {
    args: {},
};
//# sourceMappingURL=SplitButton.stories.js.map