export async function fetchGitHubRepos(
  accessToken: string
) {
  const res = await fetch(
    "https://api.github.com/user/repos",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch repos");
  }

  return res.json();
}