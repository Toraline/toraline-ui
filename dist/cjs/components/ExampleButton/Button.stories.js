"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleButton = void 0;
const Button_1 = require("./Button");
const meta = {
    title: 'Button',
    component: Button_1.Button,
};
exports.default = meta;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
exports.ExampleButton = {
    args: {
        children: 'oiee',
    },
};
//# sourceMappingURL=Button.stories.js.map