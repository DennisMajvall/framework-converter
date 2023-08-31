import { getIndexOfClosingBrace, indendations, trimString, trimStringCustom } from '../helpers';
import { NUM_INDENTATION_SPACES } from '../settings';
import { ComponentProperty, Method } from '../types';

export function getMethodsOutput(methods: Method[]): string {
  const getMethodOutput = (method: Method) => {
    const { name, statementsToRun, methodArgsString } = method;
    const args = methodArgsString.split(',').map(trimString).filter(Boolean);
    const argsString = args.length ? `${args.join(', ')}` : '';
    let currIndentation = 2;
    const statements = statementsToRun
      .map(statement => {
        if (statement.match(/^ *\}/)) currIndentation--;
        const result = `${indendations(currIndentation)}${statement}`;
        if (statement.match(/ *[a-zA-Z_].*? \{/)) currIndentation++;
        return result;
      })
      .join('\n');;
    return `const ${name} = ${argsString} => {
${statements}
${indendations()}}`;
  }
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


    const lines = content
    .trim()
    .split('\n')
    .map(s => trimStringCustom(s, [',', 'this.state.', 'this.props.'], removeWhitespace));

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

  return methods;
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