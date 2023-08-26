import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'src/app');
const defaultFile = jsonDirectory + '/example.txt';
const customFile = jsonDirectory + '/custom.txt';

export async function getData() {
  let data = '';
  try {
    data = await fs.readFile(customFile, 'utf8');
    if (!data) data = await fs.readFile(defaultFile, 'utf8');
  } catch (error) {
    data = await fs.readFile(defaultFile, 'utf8');
  }
  return data;
}

export async function setData(newData: string) {
  await fs.writeFile(customFile, newData, 'utf8');
}