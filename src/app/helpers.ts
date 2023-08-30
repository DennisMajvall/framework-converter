import { NUM_INDENTATION_SPACES } from './settings';

const DEFAULT_TO_TRIM = [';', ',', 'this.state.', 'this.props.'];

export const cleanUpName = (name: string): string => {
  return (name || '').replaceAll(/([^a-zA-Z0-9_])/g, '_').trim();
}
export const trimString = (s: string): string => {
  return trimStringCustom(s, DEFAULT_TO_TRIM);
}

export const trimStringCustom = (s: string, toRemove = DEFAULT_TO_TRIM, trim = true): string => {
  let result = s;
  for (const remove of toRemove) {
    result = result.replaceAll(remove, '');
  }
  if (trim)
    result = result.trim();

  return result;
}

export const indendations = (multiplier = 1) => ' '.repeat(NUM_INDENTATION_SPACES * multiplier);

export function getIndexOfClosingBrace(text: string, openBraceIndex: number): number {
  let curlyBrackets = 1;
  let index = openBraceIndex;
  while (curlyBrackets > 0 && index < text.length) {
    index++;
    const char = text[index];
    if (char === '{')
      curlyBrackets++;
    else if (char === '}')
      curlyBrackets--;
  }
  return index;
}
