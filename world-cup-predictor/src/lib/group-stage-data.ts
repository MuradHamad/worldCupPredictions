export interface GroupStageTeam {
  id: string;
  name: string;
  flag: string;
}

export interface GroupStageGroup {
  id: string;
  slug: string;
  name: string;
  teams: GroupStageTeam[];
}

export interface GroupStageMatch {
  id: string;
  homeTeam: GroupStageTeam;
  awayTeam: GroupStageTeam;
}

export const GROUP_STAGE_GROUPS: GroupStageGroup[] = [
  {
    id: "A",
    slug: "group-a",
    name: "Group A",
    teams: [
      { id: "mex", name: "Mexico", flag: "🇲🇽" },
      { id: "rsa", name: "South Africa", flag: "🇿🇦" },
      { id: "kor", name: "South Korea", flag: "🇰🇷" },
      { id: "eur-d", name: "Euro Playoff D", flag: "🏆" },
    ],
  },
  {
    id: "B",
    slug: "group-b",
    name: "Group B",
    teams: [
      { id: "can", name: "Canada", flag: "🇨🇦" },
      { id: "eur-a", name: "Euro Playoff A", flag: "🏆" },
      { id: "qat", name: "Qatar", flag: "🇶🇦" },
      { id: "sui", name: "Switzerland", flag: "🇨🇭" },
    ],
  },
  {
    id: "C",
    slug: "group-c",
    name: "Group C",
    teams: [
      { id: "bra", name: "Brazil", flag: "🇧🇷" },
      { id: "mar", name: "Morocco", flag: "🇲🇦" },
      { id: "hai", name: "Haiti", flag: "🇭🇹" },
      { id: "sco", name: "Scotland", flag: "🏴" },
    ],
  },
  {
    id: "D",
    slug: "group-d",
    name: "Group D",
    teams: [
      { id: "usa", name: "United States", flag: "🇺🇸" },
      { id: "par", name: "Paraguay", flag: "🇵🇾" },
      { id: "aus", name: "Australia", flag: "🇦🇺" },
      { id: "eur-c", name: "Euro Playoff C", flag: "🏆" },
    ],
  },
  {
    id: "E",
    slug: "group-e",
    name: "Group E",
    teams: [
      { id: "ger", name: "Germany", flag: "🇩🇪" },
      { id: "cur", name: "Curaçao", flag: "🇨🇼" },
      { id: "civ", name: "Ivory Coast", flag: "🇨🇮" },
      { id: "ecu", name: "Ecuador", flag: "🇪🇨" },
    ],
  },
  {
    id: "F",
    slug: "group-f",
    name: "Group F",
    teams: [
      { id: "ned", name: "Netherlands", flag: "🇳🇱" },
      { id: "jpn", name: "Japan", flag: "🇯🇵" },
      { id: "eur-b", name: "Euro Playoff B", flag: "🏆" },
      { id: "tun", name: "Tunisia", flag: "🇹🇳" },
    ],
  },
  {
    id: "G",
    slug: "group-g",
    name: "Group G",
    teams: [
      { id: "bel", name: "Belgium", flag: "🇧🇪" },
      { id: "egy", name: "Egypt", flag: "🇪🇬" },
      { id: "irn", name: "Iran", flag: "🇮🇷" },
      { id: "nzl", name: "New Zealand", flag: "🇳🇿" },
    ],
  },
  {
    id: "H",
    slug: "group-h",
    name: "Group H",
    teams: [
      { id: "esp", name: "Spain", flag: "🇪🇸" },
      { id: "cpv", name: "Cape Verde", flag: "🇨🇻" },
      { id: "ksa", name: "Saudi Arabia", flag: "🇸🇦" },
      { id: "uru", name: "Uruguay", flag: "🇺🇾" },
    ],
  },
  {
    id: "I",
    slug: "group-i",
    name: "Group I",
    teams: [
      { id: "fra", name: "France", flag: "🇫🇷" },
      { id: "sen", name: "Senegal", flag: "🇸🇳" },
      { id: "playoff-2", name: "Playoff Slot 2", flag: "🏆" },
      { id: "nor", name: "Norway", flag: "🇳🇴" },
    ],
  },
  {
    id: "J",
    slug: "group-j",
    name: "Group J",
    teams: [
      { id: "arg", name: "Argentina", flag: "🇦🇷" },
      { id: "alg", name: "Algeria", flag: "🇩🇿" },
      { id: "aut", name: "Austria", flag: "🇦🇹" },
      { id: "jor", name: "Jordan", flag: "🇯🇴" },
    ],
  },
  {
    id: "K",
    slug: "group-k",
    name: "Group K",
    teams: [
      { id: "por", name: "Portugal", flag: "🇵🇹" },
      { id: "playoff-1", name: "Playoff Slot 1", flag: "🏆" },
      { id: "uzb", name: "Uzbekistan", flag: "🇺🇿" },
      { id: "col", name: "Colombia", flag: "🇨🇴" },
    ],
  },
  {
    id: "L",
    slug: "group-l",
    name: "Group L",
    teams: [
      { id: "eng", name: "England", flag: "🏴" },
      { id: "cro", name: "Croatia", flag: "🇭🇷" },
      { id: "gha", name: "Ghana", flag: "🇬🇭" },
      { id: "pan", name: "Panama", flag: "🇵🇦" },
    ],
  },
];

export function getGroupBySlug(slug: string): GroupStageGroup | undefined {
  return GROUP_STAGE_GROUPS.find((group) => group.slug === slug);
}

export function buildGroupMatches(group: GroupStageGroup): GroupStageMatch[] {
  const matches: GroupStageMatch[] = [];

  for (let homeIndex = 0; homeIndex < group.teams.length; homeIndex += 1) {
    for (let awayIndex = homeIndex + 1; awayIndex < group.teams.length; awayIndex += 1) {
      const homeTeam = group.teams[homeIndex];
      const awayTeam = group.teams[awayIndex];

      matches.push({
        id: `${group.id}-${homeTeam.id}-${awayTeam.id}`,
        homeTeam,
        awayTeam,
      });
    }
  }

  return matches;
}
