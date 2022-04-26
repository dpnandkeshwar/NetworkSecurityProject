import { getKdcResponse } from "./kdc";

export async function handleRequest(request: Request): Promise<Response> {
  const body: any = await request.json<SessionRequest>()
  console.log("\x1b[34mincoming request\x1b[0m", JSON.stringify(body));
  const kdcResponse = await getKdcResponse(body.n1, body.alice, body.bob, body.nB);
  const responseJson = JSON.stringify(kdcResponse);
  console.log("\x1b[34moutgoing data\x1b[0m", responseJson);
  return new Response(responseJson);
}

type SessionRequest = {
  n1: string,
  alice: string,
  bob: string,
  nB: string
}