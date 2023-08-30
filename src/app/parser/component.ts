import { getIndexOfClosingBrace, indendations } from '../helpers';
import { Component, OutputTypes, ScopeIndices } from '../types';
import { getConstructor } from './constructor';
import { getImportStatements, getImportStatementsOutput } from './imports';
import { getMethods, getMethodsOutput } from './methods';
import { getProps, getPropsDeclaration, getPropsDefinition } from './props';
import { getStateVariableOutput } from './state-variables';

export function getComponentAsOutput(text: string, outputType: OutputTypes): string {
  const imports = getImportStatements(text);
  const { className, scopeIndices } = getClassNameAndScopeIndices(text);
  const componentContent = text.substring(scopeIndices.openBraceIndex, scopeIndices.closeBraceIndex);
  const props = getProps(text, className);
  const constructor = getConstructor(componentContent, props);
  const methods = getMethods(componentContent, props);
  console.log('🚀 -> file: component.ts:13 -> getComponentAsOutput -> methods:', methods);

  const component: Component = {
    constructor,
    imports,
    methods,
    name: className,
    props,
    scopeIndices,
  };

  let output = '';
  switch (outputType) {
    case OutputTypes.React:
      output = getComponentAsReactOutput(component);
      break;
    case OutputTypes.Svelte:
    case OutputTypes.Vue:
    default:
      output = 'Only React supported for now.'
      break;
  }


  // Replace 3+ new-lines in a row with max 2 new-lines.
  output = output.replace(/\n{3,}/g, '\n\n').trimStart();
  return output;
}

function getComponentAsReactOutput(component: Component): string {
  const { name, imports, props, constructor, methods } = component;
  const importStatements = getImportStatementsOutput(imports);
  const stateVariableDeclarations = [...constructor.stateVariableDeclarations]
  const stateVariablesOutput = getStateVariableOutput(stateVariableDeclarations)
  if (!props.length)
    return `${importStatements}

  const ${name} = () => {
${indendations()}${stateVariablesOutput}
`;

  const propsDeclaration = getPropsDeclaration(props);
  const propsDefinition = getPropsDefinition(props);

  return `${importStatements}

${propsDefinition}

const ${name} = ${propsDeclaration} => {
${indendations()}${stateVariablesOutput}

${indendations()}${getMethodsOutput(methods)}
}
`;
}

function getClassNameAndScopeIndices(text: string): {className: string, scopeIndices: ScopeIndices} {
  const exportClassRegex = /export class\W+(\w+)\W+extends React.Component\W+{/;
  const matchedResult = text.match(exportClassRegex);
  if (!matchedResult) {
    return {
      className: 'unknown_class_name',
      scopeIndices: {
        openBraceIndex: 0,
        closeBraceIndex: 0,
      }
    };
  }

  const openBraceIndex = (matchedResult.index || 0) + matchedResult[0].length;
  const closeBraceIndex = getIndexOfClosingBrace(text, openBraceIndex);

  return {
    className: matchedResult[1] || 'unknown_class_name',

    scopeIndices: {
      openBraceIndex,
      closeBraceIndex,
    }
  };
}
