// Thin wrapper around ryo-ma/github-profile-trophy's render_svg.ts that
// exposes column/row as CLI args, since the upstream composite action
// hardcodes them (maxColumn = -1, maxRow = 10).
import "https://deno.land/x/dotenv@v0.5.0/load.ts";

import { GithubApiService } from "../../.trophy-src/src/Services/GithubApiService.ts";
import { Card } from "../../.trophy-src/src/card.ts";
import { COLORS } from "../../.trophy-src/src/theme.ts";

const [username, outputPath = "./trophy.svg", themeName = "default", column = "-1", row = "10"] = Deno.args;

if (!username) {
  console.error(
    "Usage: render-trophy.ts USERNAME [OUTPUT_PATH] [THEME] [COLUMN] [ROW]",
  );
  Deno.exit(1);
}

const maxColumn = Number(column);
const maxRow = Number(row);

async function main() {
  console.log("Starting trophy render...");
  console.log("Username:", username);
  console.log("Output path:", outputPath);
  console.log("Theme:", themeName);
  console.log("Column/Row:", maxColumn, maxRow);

  const svc = new GithubApiService();
  const userInfoOrError = await svc.requestUserInfo(username);

  if (!(userInfoOrError && (userInfoOrError as any).totalCommits !== undefined)) {
    console.error(
      "Failed to fetch user info. Check token, username and rate limits.",
    );
    Deno.exit(2);
  }

  const userInfo = userInfoOrError as any;

  const panelSize = 115;
  const marginWidth = 10;
  const marginHeight = 10;
  const noBackground = false;
  const noFrame = false;

  const card = new Card(
    [],
    [],
    maxColumn,
    maxRow,
    panelSize,
    marginWidth,
    marginHeight,
    noBackground,
    noFrame,
  );
  const theme = (COLORS as any)[themeName] ?? (COLORS as any).default;
  const svg = card.render(userInfo, theme);

  try {
    const dir = outputPath.replace(/\/[^/]+$/, "");
    if (dir) await Deno.mkdir(dir, { recursive: true });
  } catch {
    console.error("Failed to create directory. No permission?");
    Deno.exit(3);
  }

  await Deno.writeTextFile(outputPath, svg);
  console.log(`Wrote ${outputPath}`);
}

await main();
