import { OutputTypes } from '../types';
import { getComponentAsOutput } from './component';

export const parseInput =  (input: string) => {
  let result = getComponentAsOutput(input, OutputTypes.React);
  return result;
}
