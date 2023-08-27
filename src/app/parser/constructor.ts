import { trimString } from '../helpers';
import { ComponentProperty, Constructor } from '../types';
import { extractThisStateLines, mapToStateVariable } from './state-variables';

export function getConstructor(text: string, props: ComponentProperty[]): Constructor {
  const constructorRegexResult = text.match(/( *)constructor\(.*?\)\W+{/);
  if (!constructorRegexResult) {
    return {
      stateVariableDeclarations: [],
      statementsToRun: [],
    }}

  const lines = getLinesInsideConstructor(text, constructorRegexResult);
  const thisStateLines = extractThisStateLines(lines);
  const stateVariableDeclarations = thisStateLines.parsed.map(line => mapToStateVariable(line, props));

  const statementsToRun = lines
    .filter(line => !thisStateLines.original.includes(line))
    .map(trimString);

  return {
    stateVariableDeclarations,
    statementsToRun,
  }
}

function getLinesInsideConstructor(text: string, constructorRegexResult: RegExpMatchArray): string[] {
  const startIndex = constructorRegexResult.index || 0;
  const openBraceIndex = startIndex + constructorRegexResult[0]?.length;
  const endIndex = getIndexOfClosingBrace(text, openBraceIndex);
  const content = text.substring(openBraceIndex, endIndex);
  return content.split('\n').filter(filterOutBoilerplateLines);
}


function filterOutBoilerplateLines(line: string): boolean {
  if (line.trim().startsWith('super(')) {
    return false;
  } else if (line.match(/this\..* = this\..*\.bind\(this\)/)) {
    return false;
  } else if (!line.trim()) {
    return false;
  }

  return true;
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
