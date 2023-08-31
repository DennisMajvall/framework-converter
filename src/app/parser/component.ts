import { getIndexOfClosingBrace, indendations } from '../helpers';
import { Component, OutputTypes, ScopeIndices } from '../types';
import { getConstructor } from './constructor';
import {
  getImportStatements,
  getImportStatementsOutput,
  replaceNestedReactTypes,
} from './imports';
import { getMethods, getMethodsOutput } from './methods';
import { getProps, getPropsDeclaration, getPropsDefinition } from './props';
import { getStateVariableOutput } from './state-variables';

export function getComponentAsOutput(
  text: string,
  outputType: OutputTypes
): string {
  const { className, scopeIndices } = getClassNameAndScopeIndices(text);
  const componentContent = text.substring(
    scopeIndices.openBraceIndex,
    scopeIndices.closeBraceIndex
  );
  const props = getProps(text, className);
  const constructor = getConstructor(componentContent, props);
  const methods = getMethods(componentContent, props);

  const component: Component = {
    constructor,
    methods,
    name: className,
    props,
    scopeIndices,
  };

  let output = '';
  switch (outputType) {
    case OutputTypes.React:
      output = getComponentAsReactOutput(component);
      output = getPostProcessedReactOutput(text, output);
      break;
    case OutputTypes.Svelte:
    case OutputTypes.Vue:
    default:
      output = 'Only React supported for now.';
      break;
  }

  // Replace 3+ new-lines in a row with max 2 new-lines.
  output = output.replace(/\n{3,}/g, '\n\n').trimStart();
  return output;
}

function getComponentAsReactOutput(component: Component): string {
  const { name, props, constructor, methods } = component;
  const stateVariableDeclarations = [...constructor.stateVariableDeclarations];
  const stateVariablesOutput = getStateVariableOutput(
    stateVariableDeclarations
  );
  if (!props.length)
    return `const ${name} = () => {
${indendations()}${stateVariablesOutput}
`;

  const propsDeclaration = getPropsDeclaration(props);
  const propsDefinition = getPropsDefinition(props);

  return `${propsDefinition}

const ${name} = ${propsDeclaration} => {
${indendations()}${stateVariablesOutput}

${indendations()}${getMethodsOutput(methods)}
}
`;
}

function getPostProcessedReactOutput(
  originalText: string,
  output: string
): string {
  const imports = getImportStatements(originalText, output);
  const importsAsString = getImportStatementsOutput(imports);
  let result = importsAsString + '\n\n' + output;
  result = replaceNestedReactTypes(result);

  return result;
}

function getClassNameAndScopeIndices(text: string): {
  className: string;
  scopeIndices: ScopeIndices;
} {
  const exportClassRegex = /export class\W+(\w+)\W+extends React.Component\W+{/;
  const matchedResult = text.match(exportClassRegex);
  if (!matchedResult) {
    return {
      className: 'unknown_class_name',
      scopeIndices: {
        openBraceIndex: 0,
        closeBraceIndex: 0,
      },
    };
  }

  const openBraceIndex = (matchedResult.index || 0) + matchedResult[0].length;
  const closeBraceIndex = getIndexOfClosingBrace(text, openBraceIndex);

  return {
    className: matchedResult[1] || 'unknown_class_name',

    scopeIndices: {
      openBraceIndex,
      closeBraceIndex,
    },
  };
}
