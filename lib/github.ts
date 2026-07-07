export async function fetchGitHubRepos(
  accessToken: string
) {
  const res = await fetch(
    "https://api.github.com/user/repos",
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}