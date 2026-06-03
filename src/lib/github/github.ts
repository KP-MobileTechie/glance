export interface ContributionDay {
  date: string;
  count: number;
  color: string;  // GitHub hex string — component maps to opacity
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface GitHubContributions {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubStats {
  openPRCount: number;
  recentCommits: number;  // count of push events in last 30 events
}

const CONTRIBUTION_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount color } }
        }
      }
    }
  }
`;

export async function fetchContributions(login: string, token: string): Promise<GitHubContributions> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: CONTRIBUTION_QUERY, variables: { login } }),
  });
  if (res.status === 401 || res.status === 403) throw new Error('rate-limited');
  if (!res.ok) throw new Error('network-error');
  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions: number;
            weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number; color: string }> }>;
          };
        };
      };
    };
  };
  const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error('network-error');
  return {
    totalContributions: cal.totalContributions,
    weeks: cal.weeks.map((w) => ({
      days: w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        color: d.color,
      })),
    })),
  };
}

export async function fetchGitHubStats(login: string, token: string): Promise<GitHubStats> {
  const headers = { 'Authorization': `Bearer ${token}` };
  const [eventsRes, prsRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(login)}/events?per_page=30`, { headers }),
    fetch(`https://api.github.com/search/issues?q=is:pr+is:open+author:${encodeURIComponent(login)}&per_page=5`, { headers }),
  ]);
  if (!eventsRes.ok || !prsRes.ok) throw new Error('network-error');
  const events = (await eventsRes.json()) as Array<{ type: string }>;
  const prs = (await prsRes.json()) as { total_count: number };
  const recentCommits = events.filter((e) => e.type === 'PushEvent').length;
  return { openPRCount: prs.total_count, recentCommits };
}

const GITHUB_COLOR_LEVELS: Record<string, number> = {
  '#ebedf0': 0,
  '#9be9a8': 20,
  '#40c463': 40,
  '#30a14e': 70,
  '#216e39': 100,
};

export function colorToAccentPct(githubColor: string): number {
  return GITHUB_COLOR_LEVELS[githubColor.toLowerCase()] ?? 0;
}
