import postcss from 'postcss';
import balanced from 'balanced-match';
import Color from 'color';
import { try as postcssTry } from 'postcss-message-helpers';

const mix = (c1, c2, weight) => {
  var mixed = Color(c1).mix(Color(c2), weight);
  return mixed.alpha() < 1 ? mixed.rgbaString() : mixed.hexString();
};

const transformColor = (string, source) => {
  if (string.indexOf('mix(') === -1) {
    return string;
  }

  var mixArgs = balanced('(', ')', string);

  if (!mixArgs) { throw new Error(`Missing closing parentheses in "${string}"`, source); }

  const args = mixArgs.body.split(/,\s?(?![^()]*\))/);
  return mix(args[0], args[1], (args[2] || '').replace('%', ''));
};

const transformDecl = (decl) => {
  if (!decl.value || decl.value.indexOf('mix(') === -1) {
    return;
  }

  decl.value = postcssTry(() => transformColor(decl.value, decl.source), decl.source )
};

export default postcss.plugin('postcss-color-mix', () =>
  (style) => { style.eachDecl(transformDecl); }
);
