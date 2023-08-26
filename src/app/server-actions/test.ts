"use server";

import { setData } from '@/db/save-load';


export async function myServerAction(inputBox: string) {
  console.log('myServerAction');
  console.log('server action run', inputBox?.length);
  setData(inputBox);
}