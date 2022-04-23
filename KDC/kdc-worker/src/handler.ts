import { getKdcResponse } from "./kdc";

export async function handleRequest(request: Request): Promise<Response> {
  const body: any = await request.json<SessionRequest>()
  console.log(JSON.stringify(body));
  const kdcResponse = await getKdcResponse(body.n1, body.alice, body.bob, body.nB);
  return new Response(`request method: ${request.method}`)
}

type SessionRequest = {
  n1: string,
  alice: string,
  bob: string,
  nB: string
}