import ClientPage from './client-page';
import { getData } from '../db/save-load';

export default async function Page() {
  const staticData = await getData()

  return (
  <main className="flex min-h-screen flex-col items-center p-24 gap-4">
    <h1>hello</h1>
    <ClientPage defaultInput={staticData}></ClientPage>
  </main>)
}
