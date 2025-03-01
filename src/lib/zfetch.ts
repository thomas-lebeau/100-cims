import { createZodFetcher } from "zod-fetch";

export default createZodFetcher(async (...args: Parameters<typeof fetch>) => {
  const response = await fetch(...args);

  if (!response.ok) {
    await maybeRethrow(response);

    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
});

async function maybeRethrow(response: Response) {
  let body: unknown;

  try {
    body = await response.json();
  } catch {}

  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    throw new Error(body.error);
  }
}
