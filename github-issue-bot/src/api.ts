export async function query(
  scrapeId: string,
  messages: { role: string; content: string }[],
  token: string,
  options?: {
    prompt?: string;
    clientThreadId?: string;
    fingerprint?: string;
  }
) {
  const result = await fetch(`${process.env.SERVER_HOST}/answer/${scrapeId}`, {
    method: "POST",
    body: JSON.stringify({
      messages,
      prompt: options?.prompt,
      channel: "api",
      clientThreadId: options?.clientThreadId,
      fingerprint: options?.fingerprint,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await result.json();

  if (!result.ok) {
    return {
      answer: null,
      json,
      error: json?.message ?? "Request failed",
      message: null,
    };
  }

  return {
    answer: json.content as string,
    json,
    error: null,
    message: json.message,
  };
}
