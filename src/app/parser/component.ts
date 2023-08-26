import { Component, OutputTypes } from '../types';
import { getConstructor } from './constructor';
import { getProps, getPropsDeclaration, getPropsDefinition } from './props';

export function getComponentAsOutput(text: string, outputType: OutputTypes): string {
  const className = getClassName(text);
  const props = getProps(text, className);
  const constructor = getConstructor(text);

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
  const { name, props } = component;
  if (!props.length)
    return `const ${name} = () => {`;

  const propsDeclaration = getPropsDeclaration(props);
  const propsDefinition = getPropsDefinition(props);

  return `${propsDefinition}

const ${name} = ${propsDeclaration} => {`;
}

function getClassName(text: string): string {
  const exportClassRegex = /export class\W+(\w+)\W+extends React.Component\W+{/;
  const matchedResult = text.match(exportClassRegex);
  return matchedResult?.[1] || 'unknown_class_name';
}
