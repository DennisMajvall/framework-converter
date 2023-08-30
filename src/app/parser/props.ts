import { cleanUpName, indendations, trimString } from '../helpers';
import { ANY_OR_UNKNOWN } from '../settings';
import { ComponentProperty, DefaultValueMap } from '../types';

export function getPropsDefinition(props: ComponentProperty[]): string {
  return `type Props = {
${indendations()}${getPropsAsMultilineString(props, false)}
};\n`;
}

export function getPropsDeclaration(props: ComponentProperty[]): string {
  return `({
${indendations()}${getPropNamesWithDefaultValuesAsMultilineString(props)}
}: Props)`;
}

export function getProps(text: string, className: string): ComponentProperty[] {
  const propsRegex = getPropsRegexp(className);
  const props = text.match(propsRegex)?.[1];
  if (!props) return [];

  const defaultValuesRegex = getDefaultPropValuesRegexp(className);
  const defaultValuesAsString = text.match(defaultValuesRegex)?.[1];
  const defaultValuesMap = defaultValuesAsString ? parseDefaultValues(defaultValuesAsString) : {};

  const newProps = props
    .split('\n')
    .map(trimString)
    .filter(Boolean)
    .map(extractNameAndType)
    .map(extractRequired)
    .map(prop => extractDefaultValue(prop, defaultValuesMap))
    .map(extractRemainingDefaultValuesBasedOnType);

  return newProps;
}

function getPropsAsMultilineString(props: ComponentProperty[], withSemiColon: boolean): string {
  const mapProp = ((prop: ComponentProperty): string => {
    const name = prop.name;
    const defaultValue = prop.defaultValue ? ` = ${prop.defaultValue}` : '';
    const required = prop.required ? '' : '?';
    const type = prop.type;
    const semiColon = withSemiColon ? ';' : '';
    return `${name}${required}: ${type}${defaultValue}${semiColon}`;
  });

  return props.map(mapProp).join(`,\n${indendations()}`);
}

function getPropNamesWithDefaultValuesAsMultilineString(props: ComponentProperty[]): string {
  const mapProp = ((prop: ComponentProperty): string => {
    const name = prop.name;
    const defaultValue = prop.defaultValue ? ` = ${prop.defaultValue}` : '';
    return `${name}${defaultValue}`;
  });

  return props.map(mapProp).join(`,\n${indendations()}`);
}

const getPropsRegexp = (className: string): RegExp => new RegExp(className + '\.propTypes = {(.+?)};', 's');
const getDefaultPropValuesRegexp = (className: string): RegExp => new RegExp(className + '\.defaultProps = {(.+?)};', 's');

const extractRequired = (input: ComponentProperty): ComponentProperty => {
  const required = input.type.includes('.isRequired');
  if (required) {
    return {...input, required: true, type: input.type.replace('.isRequired', '')};
  }
  return {...input, required };
}

const cleanUpType = (type?: string): string => {
  let result = (type || ANY_OR_UNKNOWN).trim();
  if (result === 'bool') {
    result = 'boolean';
  } else if (result === 'func') {
    result = '() => void';
  } else if (result === 'element') {
    result = 'React.ReactNode';
  } else if (result === 'node') {
    result = 'React.Component | null';
  } else if (result.includes('arrayOf')) {
    result = result.replace(/arrayOf\((.*)\)/, (_all, $1) => `(${cleanUpType($1)})[]`);
  }

  return result;
}

function extractNameAndType(value: string): ComponentProperty {
  let [propName, propType] = value.split(':');
  return {
    name: cleanUpName(propName),
    type: cleanUpType(propType),
    required: false,
    defaultValue: ''
  };
}

function extractNameAndDefaultValue(value: string): ComponentProperty {
  let [propName, defaultValueString] = value.split(':');
  const defaultValue = defaultValueString ? defaultValueString.trim() : undefined;
  return {
    name: cleanUpName(propName),
    type: '',
    required: false,
    defaultValue: defaultValue,
  };
}

function extractDefaultValue(input: ComponentProperty, defaultValuesMap: DefaultValueMap): ComponentProperty {
  return { ...input, defaultValue: defaultValuesMap[input.name] };
}

function parseDefaultValues(defaultValuesAsString: string): DefaultValueMap {
  const defaultValues = defaultValuesAsString
    .split('\n')
    .map(trimString)
    .filter(Boolean)
    .map(extractNameAndDefaultValue)
    .reduce((acc: DefaultValueMap, curr: ComponentProperty) => ({
        ...acc,
        [curr.name]: curr.defaultValue
      }), {} as DefaultValueMap);

  return defaultValues;
}

function extractRemainingDefaultValuesBasedOnType(input: ComponentProperty): ComponentProperty {
  if (input.defaultValue || input.required) {
    return input;
  }

  const type = input.type;
  if (type === 'boolean') {
    return { ...input, defaultValue: 'false' };
  } else if (type === 'string') {
    return { ...input, defaultValue: `''` };
  } else if (type === 'number') {
    return { ...input, defaultValue: '0' };
  } else if (type === 'React.Component | null') {
    return { ...input, defaultValue: 'null' };
  } else if (type === '() => void') {
    return { ...input, defaultValue: '() => {}' };
  } else if (type === 'object') {
    return { ...input, defaultValue: '{}' };
  } else if (type.includes('[]') || type.includes('Array<')) {
    return { ...input, defaultValue: '[]' };
  }

  return input;
}
