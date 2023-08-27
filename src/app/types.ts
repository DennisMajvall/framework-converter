export type OptionalString = string | undefined;
export type DefaultValueMap = Record<string, OptionalString>;

export type ScopeIndices = {
  openBraceIndex: number;
  closeBraceIndex: number;
}

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
  scopeIndices: ScopeIndices;
  methods: Method[];
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

export type Constructor = {
  statementsToRun: string[];
  stateVariableDeclarations: StateVariable[];
}

export type Method = {
  name: string;
  methodArgsString: string;
  statementsToRun: string[];
}

export type ThisStateDeclaration = {
  original: string[];
  parsed: string[];
}
