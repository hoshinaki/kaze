"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssjs = void 0;
const css = __importStar(require("css"));
const fs = __importStar(require("fs"));
class cssjs {
    constructor(file) {
        this.cssString = '';
        if (file) {
            this.cssString = fs.readFileSync(file, 'utf8');
        }
    }
    /**
    * Transforms a CSS string into a JS object with the following structure:
    * {
    *  selector: {
    *   property: value,
    *   property: value,
    *   property: value,
    *  },
    *  selector: {
    *   property: value,
    *   property: value,
    *   property: value,
    *   media: {
    *    property: value,
    *    property: value,
    *   }
    *  },
    * }
    * Also appends media queries to the selector
    * @param {css.Stylesheet} styles - the parsed CSS stylesheet
    */
    isolateSelectors(styles) {
        var _a;
        const transformed = styles.stylesheet ? (_a = styles.stylesheet.rules) === null || _a === void 0 ? void 0 : _a.reduce((all, rule) => {
            switch (rule.type) {
                case 'rule':
                    const r = rule;
                    const selector = r.selectors && r.selectors[0]; // TODO: check for only one selector
                    // if (selector instanceof Error) throw selector;
                    const declarations = r.declarations ? r.declarations.reduce((all2, declaration) => {
                        const { property, value } = declaration;
                        all2[property] = value;
                        return all2;
                    }, {}) : {};
                    all[selector] = Object.assign(Object.assign({}, declarations), all[selector]);
                    return all;
                case 'media':
                    const m = rule;
                    const mediaSelector = `@media ${m.media}`;
                    const mediaStyles = m.rules ? this.transform({ stylesheet: { rules: m.rules } }) : {};
                    Object.keys(mediaStyles).forEach(s => {
                        all[s] = Object.assign(Object.assign({}, all[s]), { [mediaSelector]: mediaStyles[s] });
                    });
                    return all;
                default:
                    throw new Error(`Unknown rule type: ${rule.type}`);
            }
        }, {}) : {};
        return transformed;
    }
    ;
    /**
     * Concatenates selectors with modifiers by appending parsed modifier properties to the respective selector object
     * @param {Styles} transformed - the transformed CSS stylesheet with separate selectors and their modifiers
     */
    concatSelectors(transformed) {
        const combined = {};
        Object.keys(transformed).forEach(s => {
            const declarations = transformed[s];
            const combinedSelector = s.split(':').map(s => s.trim());
            const selector = combinedSelector[0];
            const modifier = combinedSelector.length === 2 ? `&:${combinedSelector[1]}` : null;
            if (modifier) {
                combined[selector][modifier] = declarations;
            }
            else {
                combined[selector] = declarations;
            }
        });
        return combined;
    }
    ;
    /**
     * Combines the two transformation functions into one
     * @param {css.Stylesheet} styles - the parsed CSS stylesheet
     */
    transform(styles) {
        return this.concatSelectors(this.isolateSelectors(styles));
    }
    /**
     * Full process of transforming a CSS string into a JS object
     * @param {string} cssString - the CSS string to be transformed
     * @returns {Styles} the transformed CSS stylesheet JavaScript object
     */
    csstojs(cssString) {
        const parsed = css.parse(cssString !== null && cssString !== void 0 ? cssString : this.cssString, { source: 'main.css' });
        return this.transform(parsed);
    }
}
exports.cssjs = cssjs;
