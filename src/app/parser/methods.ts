import { trimString } from '../helpers';
import { ComponentProperty, Method } from '../types';

export function getMethods(text: string, props: ComponentProperty[]): Method {
  const methodRegexResult = text.replaceAll(/ *constructor\(/g, '#CONSTRUCTOR#(').match(/( *)([a-zA-Z_0-9]+) *(\(.*?\))\W*{/);
  if (!methodRegexResult) {
    return {
      statementsToRun: [],
      getters: [],
      setters: [],
    }}

  const methodName = methodRegexResult[2];
  console.log('🚀 -> file: methods.ts:15 -> methodRegexResult -> methodName:', methodName);
  const methodArgsString = methodRegexResult[3];
  console.log('🚀 -> file: methods.ts:17 -> methodRegexResult -> methodArgsString:', methodArgsString);

  const lines = getLinesInsideMethod(text, methodRegexResult);
  console.log('🚀 -> file: methods.ts:15 -> methodRegexResult -> lines:', lines);
  // const thisStateLines = extractThisStateLines(lines);
  // const stateVariableDeclarations = thisStateLines.parsed.map(line => mapToStateVariable(line, props));

  // const statementsToRun = lines
  //   .filter(line => !thisStateLines.original.includes(line))
  //   .map(trimString);

  return {
    statementsToRun: [],
    getters: [],
    setters: [],
  }
}

function getLinesInsideMethod(text: string, methodRegexResult: RegExpMatchArray): string[] {
  const startIndex = methodRegexResult.index || 0;
  const openBraceIndex = startIndex + methodRegexResult[0]?.length;
  const endIndex = getIndexOfClosingBrace(text, openBraceIndex);
  const content = text.substring(openBraceIndex, endIndex);
  return content.split('\n').map(trimString).filter(Boolean);
}

function getIndexOfClosingBrace(text: string, openBraceIndex: number): number {
  let curlyBrackets = 1;
  let index = openBraceIndex;
  while (curlyBrackets > 0) {
    index++;
    const char = text[index];
    if (char === '{')
      curlyBrackets++;
    else if (char === '}')
      curlyBrackets--;
  }
  return index;
}
