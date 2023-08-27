import { cleanUpName, indendations, trimString } from '../helpers';
import { ComponentProperty, StateVariable, ThisStateDeclaration } from '../types';

export function getStateVariableOutput(stateVariables: StateVariable[]): string {
  const mapStateVariable = ((stateVariables: StateVariable): string => {
    const name = stateVariables.name[0].toLocaleUpperCase() + stateVariables.name.slice(1);
    const defaultValue = stateVariables.defaultValue ? stateVariables.defaultValue : '';
    const type = stateVariables.type ? `<${stateVariables.type}>` : '';
    return `const [get${name}, set${name}] = useState${type}(${defaultValue});`;
  });

  return stateVariables.map(mapStateVariable).join(`,\n${indendations()}`);
}

export function extractThisStateLines(lines: string[]): ThisStateDeclaration {
  const thisStateLineStartIndex = lines.findIndex(line => line.match(/\W*this.state =/));
  const thisStateNumIndentations = lines[thisStateLineStartIndex].match(/ */)?.[0]?.length || 0;
  const thisStateLineEndIndex = lines.findIndex((line, index) => index > thisStateLineStartIndex &&  line.match(
    new RegExp(` {${thisStateNumIndentations}}\}`)
  ));

  const thisStateLines = lines.slice(thisStateLineStartIndex + 1, thisStateLineEndIndex);
  return {
    original: thisStateLines,
    parsed: thisStateLines.flatMap(line => line
      .split(',')
      .map(trimString)
    ).filter(Boolean),
  };
}

export function mapToStateVariable(line: string, props: ComponentProperty[]): StateVariable {
  const [name, defaultValue] = line.split(':').map(trimString);
  const propFound = props.find(prop => prop.name === defaultValue);
  return {
    name: cleanUpName(name),
    type: propFound?.type || '',
    defaultValue,
  }
}