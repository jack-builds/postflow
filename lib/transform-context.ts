type Commit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
};

export function transformCommitContext(
  commits: Commit[]
) {
  const messages = commits.map((commit) => {
    return `- ${commit.commit.message}`;
  });

  return {
    summary: messages.join("\n"),

    stage: inferStage(messages),

    tone: "technical",
  };
}

function inferStage(messages: string[]) {
  const joined = messages.join(" ").toLowerCase();

  if (
    joined.includes("fix") ||
    joined.includes("bug")
  ) {
    return "debugging";
  }

  if (
    joined.includes("refactor")
  ) {
    return "refactoring";
  }

  if (
    joined.includes("add") ||
    joined.includes("build")
  ) {
    return "building";
  }

  return "development";
}