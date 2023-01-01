import * as css from 'css';
import * as fs from 'fs';

interface Declarations {
  [property: string]: string | Declarations;
}

interface Styles {
  [selector: string]: Declarations;
}

const transform = (styles: css.Stylesheet): Styles => {
  const transformed: Styles = styles.stylesheet ? styles.stylesheet.rules?.reduce((all: Styles, rule: css.Rule) => {
    if (rule.type !== 'rule') return all;
    const selector = rule.selectors && rule.selectors[0];
    // if (selector instanceof Error) throw selector;
    const declarations: Declarations = rule.declarations ? rule.declarations.reduce((all2: Declarations, declaration: css.Declaration) => {
      const { property, value } = declaration;
      all2[property as string] = value as string;
      return all2;
    }, {} as Declarations) : {};
    all[selector as string] = declarations;
    return all;
  }, {} as Styles) : {};
  return transformed;
};

const concatSelectors = (transformed: Styles) => {
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

const cssString = fs.readFileSync('main.css', 'utf8');
const parsed = css.parse(cssString, { source: 'main.css' });
console.log(JSON.stringify(parsed, null, 2));
const transformed = transform(parsed);
console.log(transformed);
const combined = concatSelectors(transformed);
console.log(combined);


