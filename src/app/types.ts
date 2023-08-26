export type PropDefaultValue = string | undefined;
export type DefaultValueMap = Record<string, PropDefaultValue>;

export type ComponentProperty = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: PropDefaultValue;
}

export type Component = {
  name: string;
  props: ComponentProperty[];
  constructor: string;
}

export enum OutputTypes {
  React = 'React',
  Svelte = 'Svelte',
  Vue = 'Vue',
}
