import 'tsx';

export default async function handler(req: any, res: any) {
  const { default: serverHandler } = await import('../server.ts');
    return serverHandler(req, res);
    }
    