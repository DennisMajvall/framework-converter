export type OptionalString = string | undefined;
export type DefaultValueMap = Record<string, OptionalString>;

export type ComponentProperty = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: OptionalString;
}

export type Component = {
  name: string;
  props: ComponentProperty[];
  constructor: Constructor;
}

export enum OutputTypes {
  React = 'React',
  Svelte = 'Svelte',
  Vue = 'Vue',
}

export type StateVariable = {
  name: string;
  type: string;
  defaultValue: OptionalString;
}

export type StateVariableGetters = {
  localVariableName: OptionalString;
  name: string;
}

export type StateVariableSetters = {
  name: string;
  value: string;
}

export type Constructor = {
  statementsToRun: string[];
  stateVariableDeclarations: StateVariable[];
}

export type Method = {
  statementsToRun: string[];
  getters: StateVariableGetters[];
  setters: StateVariableSetters[];
}

export type ThisStateDeclaration = {
  original: string[];
  parsed: string[];
}
