'use client'

import { useEffect, useState } from 'react';
import { myServerAction } from '../app/server-actions/test'
import { parseInput } from './parser';

export default function ClientPage({ defaultInput }: any) {
  const [inputData, setInputData] = useState<string>(defaultInput);
  const [outputData, setOutputData] = useState<string>('');

  useEffect(() => {
    setOutputData(parseInput(inputData));
  }, [inputData]);

  return (
    <form className='flex gap-4 ' action={() => myServerAction(inputData)}>
      <div className='flex gap-4 flex-col'>
        <textarea className='bg-gray-600 py-1 px-2'
          name="input-box"
          id="input-box"
          cols={60}
          rows={30}
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}>
        </textarea>
        <button type="submit">Save input</button>
      </div>
      <textarea className='bg-gray-600 py-1 px-2' cols={60} rows={30} value={outputData} readOnly></textarea>
    </form>
  );
}