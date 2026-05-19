export async function fetchCommits(
  owner: string,
  repo: string,
  token: string
) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch commits");
  }

  return res.json();
}