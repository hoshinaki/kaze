import * as css from 'css';
import * as fs from 'fs';

interface Declarations {
  [property: string]: string | Declarations;
}

interface Styles {
  [selector: string]: Declarations;
}

export class cssjs {
  cssString: string = '';
  constructor(file?: string) {
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
  isolateSelectors(styles: css.Stylesheet): Styles {
    const transformed: Styles = styles.stylesheet ? styles.stylesheet.rules?.reduce((all: Styles, rule: css.Rule | css.Media) => {
      switch (rule.type) {
        case 'rule':
          const r = rule as css.Rule;
          const selector = r.selectors && r.selectors[0]; // TODO: check for only one selector
          // if (selector instanceof Error) throw selector;
          const declarations: Declarations = r.declarations ? r.declarations.reduce((all2: Declarations, declaration: css.Declaration) => {
            const { property, value } = declaration;
            all2[property as string] = value as string;
            return all2;
          }, {} as Declarations) : {};
          all[selector as string] = { ...declarations, ...all[selector as string] };
          return all;
        case 'media':
          const m = rule as css.Media;
          const mediaSelector = `@media ${m.media}`;
          const mediaStyles = m.rules ? this.transform({ stylesheet: { rules: m.rules } }) : {};
          Object.keys(mediaStyles).forEach(s => {
            all[s as string] = { ...all[s as string], [mediaSelector]: mediaStyles[s as string] };
          });
          return all;
        default:
          throw new Error(`Unknown rule type: ${rule.type}`);
      }
    }, {} as Styles) : {};
    return transformed;
  };

  /**
   * Concatenates selectors with modifiers by appending parsed modifier properties to the respective selector object
   * @param {Styles} transformed - the transformed CSS stylesheet with separate selectors and their modifiers
   */
  concatSelectors(transformed: Styles): Styles {
    const combined: Styles = {};
    Object.keys(transformed).forEach(s => {
      const declarations = transformed[s];
      const combinedSelector = s.split(':').map(s => s.trim());
      const selector = combinedSelector[0];
      const modifier = combinedSelector.length === 2 ? `&:${combinedSelector[1]}` : null;
      if (modifier) {
        combined[selector][modifier] = declarations;
      } else {
        combined[selector] = declarations;
      }
    });
    return combined;
  };

  /**
   * Combines the two transformation functions into one
   * @param {css.Stylesheet} styles - the parsed CSS stylesheet
   */
  transform(styles: css.Stylesheet): Styles {
    return this.concatSelectors(this.isolateSelectors(styles))
  }

  /**
   * Full process of transforming a CSS string into a JS object
   * @param {string} cssString - the CSS string to be transformed
   * @returns {Styles} the transformed CSS stylesheet JavaScript object
   */
  csstojs(cssString?: string): Styles {
    const parsed = css.parse(cssString ?? this.cssString, { source: 'main.css' });
    return this.transform(parsed);
  }
}