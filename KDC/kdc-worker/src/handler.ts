import { getKdcResponse } from "./kdc";
import { logTitledJson, logTitledObject } from "./outputUtil";

export async function handleRequest(request: Request): Promise<Response> {
  const body: any = await request.json<SessionRequest>()
  // console.log("\x1b[34mINCOMING REQUEST\x1b[0m", `\n${JSON.stringify(body, undefined, 2)}`);
  logTitledObject('INCOMING DATA', body);
  const kdcResponse = await getKdcResponse(body.n1, body.alice, body.bob, body.nB);
  const responseJson = JSON.stringify(kdcResponse);
  // console.log("\x1b[34mOUTGOING DATA\x1b[0m", `\n${JSON.stringify(JSON.parse(responseJson), undefined, 2)}`);
  logTitledJson('OUTGOING DATA', responseJson);
  return new Response(responseJson);
}

type SessionRequest = {
  n1: string,
  alice: string,
  bob: string,
  nB: string
}