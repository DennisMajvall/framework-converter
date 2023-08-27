import { NUM_INDENTATION_SPACES } from './settings';

export const cleanUpName = (name: string): string => {
  return (name || '').replaceAll(/([^a-zA-Z0-9_])/g, '_').trim();
}
export const trimString = (s: string): string => {
  const toRemove = [';', ',', '=', 'this.state.', 'this.props.'];
  let result = s;
  for (const remove of toRemove) {
    result = result.replaceAll(remove, '');
  }
  return result.trim();
}

export const indendations = () => ' '.repeat(NUM_INDENTATION_SPACES);

