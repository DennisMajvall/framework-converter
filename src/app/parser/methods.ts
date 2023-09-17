import { getIndexOfClosingBrace, indendations, trimString, trimStringCustom } from '../helpers';
import { NUM_INDENTATION_SPACES } from '../settings';
import { ComponentProperty, Method } from '../types';

function indentStatementsOnScopeChanges(statements: string[]) {
  let currIndentation = NUM_INDENTATION_SPACES;
  return statements
    .map(statement => {
      if (statement.match(/^ *\}/)) currIndentation--;
      const result = `${indendations(currIndentation)}${statement}`;
      if (statement.match(/ *[a-zA-Z_].*? \{/)) currIndentation++;
      return result;
    });
}

export function getMethodsOutput(methods: Method[]): string {
  const getRenderMethodOutput = (method: Method) => {
    const { statementsToRun: statementsToRunWithIndentation } = method;
    const statementsToRun = statementsToRunWithIndentation.map((line, index) =>
      line.slice(index === 0 ? NUM_INDENTATION_SPACES * 2 : NUM_INDENTATION_SPACES)
    );
    const returnStartIndex = statementsToRun.findIndex(line => line.trim().startsWith('return (')) + 1;
    const statementsBeforeReturn = statementsToRun.splice(0, returnStartIndex);

    return `${statementsBeforeReturn.join('\n')}
${statementsToRun.join('\n')}`;
  };

  const convertOnMountedFunction = (method: Method) => {
    const { statementsToRun } = method;
    const statements = indentStatementsOnScopeChanges(statementsToRun);

    return `useEffect(() => {
${statements.join('\n')}
${indendations()}}, []);`;
  };

  const getMethodOutput = (method: Method) => {
    const { name, statementsToRun, methodArgsString } = method;
    if (name === 'render') return getRenderMethodOutput(method);
    if (name === 'componentDidMount') return convertOnMountedFunction(method);

    const args = methodArgsString.split(',').map(trimString).filter(Boolean);
    const argsString = args.length ? `${args.join(', ')}` : '';
    const statements = indentStatementsOnScopeChanges(statementsToRun);
    return `const ${name} = ${argsString} => {
${statements.join('\n')}
${indendations()}};`;
  };

  return methods.map(getMethodOutput).join(`\n\n${indendations()}`);
}

export function getMethods(allText: string, props: ComponentProperty[]): Method[] {
  const methods: Method[] = [];

  const numIndentationOfMethods = allText.match(/( *)constructor\(.*?\)\W+{/)?.[1]?.length || NUM_INDENTATION_SPACES;
  let text = allText;
  const methodRegexp = new RegExp(`^( {${numIndentationOfMethods}})([a-zA-Z_0-9]+) *\((.*?)\)\W*{`, 'm');
  let regexResult;

  while(regexResult = text.match(methodRegexp)) {
    const name = regexResult[2];
    const methodArgsString = regexResult[3];
    const openBraceIndex = (regexResult.index || 0) + regexResult[0]?.length;
    const endIndex = getIndexOfClosingBrace(text, openBraceIndex);

    if (['constructor'].includes(name)) {
      text = text.slice(endIndex);
      continue;
    }

    const removeWhitespace = name !== 'render';

    let content = text.substring(openBraceIndex, endIndex);
    content = replacePropsDestructors(content);
    content = replaceGetters(content);
    content = replaceSetters(content);
    content = content.trim();


    const lines = content
      .split('\n')
      .map(s => s.match(/^\w.*$/) ? `${indendations(2)}${s}` : s)
      .map(s => trimStringCustom(s, ['this.state.', 'this.props.'], removeWhitespace));

    methods.push({
      name,
      statementsToRun: lines,
      methodArgsString,
    });

    text = text.slice(endIndex);
  }

  const methodNames = methods.map(m => m.name);

  for (const method of methods) {
    method.statementsToRun = method.statementsToRun.map(statement => {
      let result = statement;
      const methodsUsed = methodNames.filter(name => statement.includes(`this.${name}`));
      for (const name of methodsUsed) {
        result = result.replaceAll(`this.${name}`, `${name}`);
      }
      return result;
    });
  }

  const sortedMethods = [...methods].sort((a, b) => {
    if (a.name === 'componentDidMount') return -1
    if (a.name === 'render') return 1;
    return a.name.localeCompare(b.name)
  })

  return sortedMethods;
}

const replaceSetters = (content: string): string => {
  const regex = /this\.setState\({(.+?)}\)/g;
  let result = content;
  let match;
  while (match = regex.exec(content)) {
    const stateVariableDeclarations = match[1].split(',').map(trimString).filter(Boolean);
    const stateVariableAssignments = stateVariableDeclarations.map(declaration => {
      const [name, value] = declaration.split(':').map(trimString);
      return `set${name[0].toUpperCase()}${name.slice(1)}(${value})`;
    });
    const stateVariableAssignmentsString = stateVariableAssignments.join(', ');
    result = result.replace(match[0], stateVariableAssignmentsString);
  }
  return result;
}

const replacePropsDestructors = (content: string): string => {
  const regex = /const {(.+?)} = this\.props;/gs;
  let result = content;
  let match;
  while (match = regex.exec(content)) {
    result = result.replace(match[0], '');
  }
  return result;
}

const replaceGetters = (content: string): string => {
  const regex = /const {(.+?)} = this\.state;/gs;
  let result = content;
  let match;
  while (match = regex.exec(content)) {
    const stateVariableDeclarations = match[1].split(',').map(trimString).filter(s => !s.startsWith('}')).filter(Boolean);
    const stateVariableAssignments = stateVariableDeclarations.map(declaration => {
      const [name] = declaration.split(':').map(trimString);
      return `const ${name} = get${name[0].toUpperCase()}${name.slice(1)};`;
    });
    const stateVariableAssignmentsString = stateVariableAssignments.join('\n');
    result = result.replace(match[0], stateVariableAssignmentsString);
  }
  return result;
}