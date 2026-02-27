import jwt from "jsonwebtoken";

export async function getToken(installationId: number): Promise<string> {
  const githubAppId = process.env.GITHUB_APP_ID;
  const githubPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!githubAppId || !githubPrivateKey) {
    throw new Error("GitHub app authentication not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const iat = now - 30;
  const jwtToken = jwt.sign(
    {
      iat,
      exp: iat + 60 * 9,
      iss: githubAppId,
    },
    githubPrivateKey,
    { algorithm: "RS256" }
  );

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installation token: ${error}`);
  }

  const data = await response.json();
  return data.token;
}
