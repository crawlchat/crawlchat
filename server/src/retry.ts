async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry(
  fn: (nTime: number, error?: any) => Promise<any>,
  options?: {
    times?: number;
    delay?: number;
  }
) {
  const { times = 2, delay = 500 } = options ?? {};
  let nTime = 0;
  let error: any;
  while (nTime < times) {
    if (nTime > 0) {
      console.log("Error", error);
      console.log("Retrying ", nTime);
    }

    try {
      return await fn(nTime);
    } catch (e) {
      nTime++;
      error = e;
      await sleep(delay);
    }
  }
  throw error;
}
