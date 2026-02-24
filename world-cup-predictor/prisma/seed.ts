import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const teams = [
  // Group A
  { name: "Argentina", code: "ARG", group: "A", flag: "🇦🇷" },
  { name: "Canada", code: "CAN", group: "A", flag: "🇨🇦" },
  { name: "Mexico", code: "MEX", group: "A", flag: "🇲🇽" },
  { name: "Saudi Arabia", code: "KSA", group: "A", flag: "🇸🇦" },
  
  // Group B
  { name: "Albania", code: "ALB", group: "B", flag: "🇦🇱" },
  { name: "Croatia", code: "CRO", group: "B", flag: "🇭🇷" },
  { name: "Spain", code: "ESP", group: "B", flag: "🇪🇸" },
  { name: "Italy", code: "ITA", group: "B", flag: "🇮🇹" },
  
  // Group C
  { name: "Australia", code: "AUS", group: "C", flag: "🇦🇺" },
  { name: "Denmark", code: "DEN", group: "C", flag: "🇩🇰" },
  { name: "England", code: "ENG", group: "C", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Serbia", code: "SRB", group: "C", flag: "🇷🇸" },
  
  // Group D
  { name: "Algeria", code: "ALG", group: "D", flag: "🇩🇿" },
  { name: "Brazil", code: "BRA", group: "D", flag: "🇧🇷" },
  { name: "Morocco", code: "MAR", group: "D", flag: "🇲🇦" },
  { name: "DR Congo", code: "COD", group: "D", flag: "🇨🇩" },
  
  // Group E
  { name: "Belgium", code: "BEL", group: "E", flag: "🇧🇪" },
  { name: "Romania", code: "ROU", group: "E", flag: "🇷🇴" },
  { name: "Slovakia", code: "SVK", group: "E", flag: "🇸🇰" },
  { name: "Ukraine", code: "UKR", group: "E", flag: "🇺🇦" },
  
  // Group F
  { name: "France", code: "FRA", group: "F", flag: "🇫🇷" },
  { name: "Germany", code: "GER", group: "F", flag: "🇩🇪" },
  { name: "Ghana", code: "GHA", group: "F", flag: "🇬🇭" },
  { name: "USA", code: "USA", group: "F", flag: "🇺🇸" },
  
  // Group G
  { name: "Colombia", code: "COL", group: "G", flag: "🇨🇴" },
  { name: "Ecuador", code: "ECU", group: "G", flag: "🇪🇨" },
  { name: "Netherlands", code: "NED", group: "G", flag: "🇳🇱" },
  { name: "Qatar", code: "QAT", group: "G", flag: "🇶🇦" },
  
  // Group H
  { name: "Chile", code: "CHI", group: "H", flag: "🇨🇱" },
  { name: "Panama", code: "PAN", group: "H", flag: "🇵🇦" },
  { name: "Peru", code: "PER", group: "H", flag: "🇵🇪" },
  { name: "Uruguay", code: "URU", group: "H", flag: "🇺🇾" },
  
  // Group I
  { name: "Cameroon", code: "CMR", group: "I", flag: "🇨🇲" },
  { name: "Nigeria", code: "NGA", group: "I", flag: "🇳🇬" },
  { name: "Portugal", code: "POR", group: "I", flag: "🇵🇹" },
  { name: "South Africa", code: "RSA", group: "I", flag: "🇿🇦" },
  
  // Group J
  { name: "Austria", code: "AUT", group: "J", flag: "🇦🇹" },
  { name: "Finland", code: "FIN", group: "J", flag: "🇫🇮" },
  { name: "Norway", code: "NOR", group: "J", flag: "🇳🇴" },
  { name: "Poland", code: "POL", group: "J", flag: "🇵🇱" },
  
  // Group K
  { name: "Czech Republic", code: "CZE", group: "K", flag: "🇨🇿" },
  { name: "Iceland", code: "ISL", group: "K", flag: "🇮🇸" },
  { name: "Sweden", code: "SWE", group: "K", flag: "🇸🇪" },
  { name: "Turkey", code: "TUR", group: "K", flag: "🇹🇷" },
  
  // Group L
  { name: "Bolivia", code: "BOL", group: "L", flag: "🇧🇴" },
  { name: "Cuba", code: "CUB", group: "L", flag: "🇨🇺" },
  { name: "Haiti", code: "HAI", group: "L", flag: "🇭🇹" },
  { name: "Jamaica", code: "JAM", group: "L", flag: "🇯🇲" },
];

async function main() {
  console.log("Starting database seed...");

  // Clear existing teams
  await prisma.team.deleteMany();
  console.log("Cleared existing teams");

  // Seed new teams
  for (const team of teams) {
    await prisma.team.create({
      data: team,
    });
  }

  const count = await prisma.team.count();
  console.log(`Seeded ${count} teams successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
