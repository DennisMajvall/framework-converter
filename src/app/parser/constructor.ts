export function getConstructor(text: string): string {
  const constructorRegexResult = text.match(/( *)constructor\(.*?\)\W+{/);
  console.log('🚀 -> file: constructor.ts:5 -> constructorRegexResult -> constructorRegexResult:', constructorRegexResult);
  if (!constructorRegexResult)
    return '';

  const constructorIndex = constructorRegexResult.index || 0;
  const constructorOpenBraceIndex = constructorIndex + constructorRegexResult[0]?.length;
  const constructorEndIndex = getIndexOfClosingBrace(text, constructorOpenBraceIndex);
  const constructorContent = text.substring(constructorOpenBraceIndex, constructorEndIndex);
  const constructorLines = constructorContent.split('\n').filter(Boolean);
  const constructorLineIndexDeclaringThisState = constructorLines.findIndex(line => line.match(/\W*this.state =/));
  const thisStateIndentation = constructorLines[constructorLineIndexDeclaringThisState].match(/ */)?.[0] || '';
  const thisStateIndentationNumIndentations = thisStateIndentation.length;
  const thisStateClosingBraceWithTheSameIndentation = constructorLines.findIndex((line, index) => index>constructorLineIndexDeclaringThisState &&  line.match(
    new RegExp(` {${thisStateIndentationNumIndentations}}\}`)
  ));
  const thisStateVariableDeclarationLines = constructorLines.slice(constructorLineIndexDeclaringThisState+1, thisStateClosingBraceWithTheSameIndentation);
  console.log('🚀 -> file: constructor.ts:12 -> constructorRegexResult -> constructorLines:', constructorLines);
  console.log('🚀 -> file: constructor.ts:27 -> getConstructor -> thisStateVariableDeclarationLines:', thisStateVariableDeclarationLines);

  return '';
}

function getIndexOfClosingBrace(text: string, constructorOpenBraceIndex: number): number {
  let curlyBrackets = 1;
  let index = constructorOpenBraceIndex;
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
