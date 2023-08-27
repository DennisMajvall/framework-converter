import { indendations } from '../helpers';
import { Component, OutputTypes } from '../types';
import { getConstructor } from './constructor';
import { getMethods } from './methods';
import { getProps, getPropsDeclaration, getPropsDefinition } from './props';
import { getStateVariableOutput } from './state-variables';

export function getComponentAsOutput(text: string, outputType: OutputTypes): string {
  const className = getClassName(text);
  const props = getProps(text, className);
  const constructor = getConstructor(text, props);
  const methods = getMethods(text, props);
  console.log('🚀 -> file: component.ts:13 -> getComponentAsOutput -> methods:', methods);

  const component: Component = {
    name: className,
    props,
    constructor,
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
  const { name, props, constructor } = component;
  const stateVariableDeclarations = [...constructor.stateVariableDeclarations]
  const stateVariablesOutput = getStateVariableOutput(stateVariableDeclarations)
  if (!props.length)
    return `const ${name} = () => {
${indendations()}${stateVariablesOutput}
`;

  const propsDeclaration = getPropsDeclaration(props);
  const propsDefinition = getPropsDefinition(props);

  return `${propsDefinition}

const ${name} = ${propsDeclaration} => {
${indendations()}${stateVariablesOutput}
`;
}

function getClassName(text: string): string {
  const exportClassRegex = /export class\W+(\w+)\W+extends React.Component\W+{/;
  const matchedResult = text.match(exportClassRegex);
  return matchedResult?.[1] || 'unknown_class_name';
}
