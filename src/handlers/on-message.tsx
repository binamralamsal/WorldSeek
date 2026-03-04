import { InputFile } from "grammy";
import type { ReactionTypeEmoji } from "grammy/types";
import { Composer, Context, GrammyError } from "grammy";

import sharp from "sharp";
import { join } from "path";
import satori from "satori";
import { readFile } from "fs/promises";

import { db } from "../config/db";
import type { Country } from "../types";
import countries from "../data/countries.json";
import { getDirection } from "../util/get-direction";
import { getDistanceKm } from "../util/get-distance";

const composer = new Composer();

const normalize = (str: string) => str.trim().toLowerCase();

const countryMap = new Map(countries.map((c) => [c.code, c]));

/*
 Alias lookup map (O(1) search instead of scanning whole array)
*/
const aliasMap = new Map<string, Country>();

for (const c of countries) {
  for (const a of c.aliases) {
    aliasMap.set(a, c);
  }
}

function generateHints(country: Country, guesses: number): string[] {
  const hints: string[] = [];

  if (guesses >= 5) {
    hints.push(`🌐 UN Member: ${country.unMember ? "Yes" : "No"}`);
  }

  if (guesses >= 10) {
    hints.push(
      `🚗 Drives on: ${country.carSide === "right" ? "Right side" : "Left side"}`,
    );
  }

  if (guesses >= 12) {
    hints.push(`🌍 Continent: ${country.continents.join(", ")}`);
  }

  if (guesses >= 14) {
    hints.push(`📅 Week starts on: ${country.startOfWeek}`);
  }

  return hints;
}

async function handleWorldSeek(ctx: Context) {
  if (!ctx.msg || !ctx.chat || !ctx.message) return;

  const currentTopicId = ctx.msg.message_thread_id?.toString() || "general";
  const chatId = ctx.chat.id.toString();

  const game = await db
    .selectFrom("games")
    .selectAll()
    .where("chatId", "=", chatId)
    .where("topicId", "=", currentTopicId)
    .executeTakeFirst();

  if (!game) return;

  const guessText = normalize(ctx.message.text ?? "");

  if (guessText.length <= 2) return;

  const guessedCountry = aliasMap.get(guessText);

  if (!guessedCountry) return;

  const existingGuess = await db
    .selectFrom("guesses")
    .select("id")
    .where("gameId", "=", game.id)
    .where("guessCode", "=", guessedCountry.code)
    .executeTakeFirst();

  if (existingGuess) {
    return ctx.reply(`Someone has already guessed ${guessedCountry.name}`);
  }

  const correctCountry = countryMap.get(game.countryCode)!;

  const isNeighbor = correctCountry.borders.includes(guessedCountry.code);

  let distance = getDistanceKm(
    guessedCountry.lat,
    guessedCountry.lng,
    correctCountry.lat,
    correctCountry.lng,
  );

  if (isNeighbor) distance = 0;

  await db
    .insertInto("guesses")
    .values({
      gameId: game.id,
      guessCode: guessedCountry.code,
      distanceKm: distance,
    })
    .execute();

  if (guessedCountry.code === correctCountry.code) {
    await revealWorldSeekResult(ctx, game.id, correctCountry, true);
    return;
  }

  const guesses = await db
    .selectFrom("guesses")
    .selectAll()
    .where("gameId", "=", game.id)
    .orderBy("id", "asc")
    .execute();

  if (guesses.length >= 20) {
    await revealWorldSeekResult(
      ctx,
      game.id,
      correctCountry,
      false,
      "Maximum guesses (20) reached.",
    );
    return;
  }

  const guessLines = guesses
    .map((g, i) => {
      const country = countryMap.get(g.guessCode)!;

      if (g.distanceKm === 0 && country.code !== correctCountry.code) {
        return `${i + 1}. ${country.name} — 🟢 Neighbor`;
      }

      if (country.code === correctCountry.code) {
        return `${i + 1}. ${country.name} — 🎯 Correct`;
      }

      const direction = getDirection(
        country.lat,
        country.lng,
        correctCountry.lat,
        correctCountry.lng,
      );

      return `${i + 1}. ${country.name} — ${g.distanceKm.toLocaleString()} km ${direction}`;
    })
    .join("\n");

  const hints = generateHints(correctCountry, guesses.length);

  const hintText =
    hints.length > 0
      ? `\n\n<b>Hints:</b>\n${hints.map((h) => `• ${h}`).join("\n")}`
      : "";

  const imagePath = join(
    process.cwd(),
    "src",
    "data",
    "countries",
    `${correctCountry.code.toLowerCase()}.png`,
  );

  await ctx.replyWithPhoto(new InputFile(imagePath), {
    caption: `🌍 WorldSeek\n\n<b>Distance from the country:</b>\n${guessLines}${hintText}`,
    parse_mode: "HTML",
    protect_content: true,
  });
}

export async function generateWorldlSeekImage(
  country: Country,
): Promise<Buffer> {
  const silhouettePath = join(
    process.cwd(),
    "src",
    "data",
    "countries",
    `${country.code.toLowerCase()}.png`,
  );

  const silhouette = await readFile(silhouettePath);
  const greenSilhouette = await sharp(silhouette).tint("#2ecc71").toBuffer();

  const fontPath = join(process.cwd(), "src/fonts/roboto.ttf");
  const fontData = await readFile(fontPath);

  const svg = await satori(
    <div
      style={{
        display: "flex",
        width: 900,
        height: 450,
        background: "linear-gradient(145deg, #01193d 0%, #000c1d 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter",
        color: "white",
      }}
    >
      {/* Decorative Background Orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(95, 166, 70, 0.12) 0%, transparent 70%)",
          top: -150,
          left: -150,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(1, 25, 61, 0.4) 0%, transparent 70%)",
          bottom: -100,
          right: -50,
          display: "flex",
        }}
      />

      {/* World Map Dot Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          backgroundImage:
            "radial-gradient(rgba(95, 166, 70, 0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          display: "flex",
        }}
      />

      {/* LEFT SIDE — Silhouette */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 320,
          minWidth: 320,
          position: "relative",
          background: "rgba(255, 255, 255, 0.03)",
          borderRight: "1px solid rgba(95, 166, 70, 0.1)",
        }}
      >
        {/* Silhouette Glow */}
        <div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(95, 166, 70, 0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Silhouette Image — Updated to match #5fa646 */}
        <img
          src={`data:image/png;base64,${greenSilhouette.toString("base64")}`}
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
            filter:
              "invert(61%) sepia(38%) saturate(543%) hue-rotate(61deg) brightness(92%) contrast(88%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontWeight: 600,
            }}
          >
            Region
          </div>
          <div
            style={{
              display: "flex",
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {country.region}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "0 60px",
          minWidth: 0,
        }}
      >
        {/* Header: Flag + Code */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: 4,
              overflow: "hidden",
              width: 48,
              height: 32,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <img
              src={country.flag}
              style={{ width: 48, height: 32, display: "flex" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              color: "#5fa646",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 1.5,
            }}
          >
            {country.code}
          </div>
        </div>

        {/* Name — dynamic font size */}
        <div
          style={{
            display: "flex",
            fontSize:
              country.name.length > 30
                ? 36
                : country.name.length > 20
                  ? 44
                  : 56,
            fontWeight: 800,
            letterSpacing: country.name.length > 20 ? "-0.5px" : "-1.5px",
            lineHeight: 1.1,
            marginBottom: 32,
            color: "#ffffff",
          }}
        >
          {country.name}
        </div>

        {/* Grid Data */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Row 1: Capital & Population */}
          <div style={{ display: "flex", gap: 40 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Capital
              </div>
              <div
                style={{
                  display: "flex",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1.3,
                }}
              >
                {country.capital ?? "N/A"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Population
              </div>
              <div
                style={{
                  display: "flex",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {country.population.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Row 2: Coordinates */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Coordinates
            </div>
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.6)",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "monospace",
              }}
            >
              {country.lat.toFixed(2)}° N / {country.lng.toFixed(2)}° E
            </div>
          </div>
        </div>

        {/* Bottom Accent Line — Updated to #5fa646 */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            height: 3,
            width: 80,
            borderRadius: 2,
            background: "linear-gradient(90deg, #5fa646, transparent)",
          }}
        />
      </div>
    </div>,
    {
      width: 900,
      height: 450,
      fonts: [{ name: "Roboto", data: fontData, weight: 700 }],
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function revealWorldSeekResult(
  ctx: Context,
  gameId: number,
  country: Country,
  isWin: boolean,
  reason?: string,
) {
  if (!ctx.chat || !ctx.from || !ctx.msgId) return;

  const chatId = ctx.chat.id.toString();

  const imageBuffer = await generateWorldlSeekImage(country);
  const caption = formatWorldSeekDetails(country, isWin, reason);

  await db.transaction().execute(async (trx) => {
    if (!ctx.from) return;

    if (isWin) {
      await trx
        .insertInto("leaderboard")
        .values({
          score: 10,
          chatId,
          userId: ctx.from.id.toString(),
        })
        .execute();
    }

    await trx.deleteFrom("guesses").where("gameId", "=", gameId).execute();
    await trx.deleteFrom("games").where("id", "=", gameId).execute();
  });

  await ctx.replyWithPhoto(new InputFile(imageBuffer), {
    caption,
    parse_mode: "HTML",
    protect_content: true,
    reply_parameters: { message_id: ctx.msgId },
  });

  if (isWin) await reactWithRandom(ctx);
}

export function formatWorldSeekDetails(
  country: Country,
  isWin: boolean,
  reason?: string,
): string {
  const borders =
    country.borders.length > 0
      ? country.borders.map((c) => countryMap.get(c)?.name ?? c).join(", ")
      : "None";

  return `
<blockquote>${isWin ? "🎉 Correct!" : "🎮 Game Over"}</blockquote>
<blockquote>🌍 <b>${country.name}</b> (${country.code})

🏛 Capital: ${country.capital ?? "N/A"}
🌎 Region: ${country.region}
👥 Population: ${country.population.toLocaleString()}
📏 Area: ${country.area.toLocaleString()} km²
🗺 Continents: ${country.continents.join(", ")}
🚗 Drives on: ${country.carSide}
📅 Week starts: ${country.startOfWeek}
🌐 UN Member: ${country.unMember ? "Yes" : "No"}
📍 Coordinates: ${country.lat.toFixed(2)}° / ${country.lng.toFixed(2)}
🧭 Neighboring Countries: ${borders}</blockquote><blockquote>${reason ?? ""}${isWin ? "🏆 +10 points added to leaderboard." : ""}</blockquote>
Start another game with /newworld
`.trim();
}

composer.on("message:text", async (ctx) => {
  await handleWorldSeek(ctx);
});

export const onMessageHander = composer;

async function reactWithRandom(ctx: Context) {
  const emojis: ReactionTypeEmoji["emoji"][] = [
    "🎉",
    "🏆",
    "🤩",
    "⚡",
    "🫡",
    "💯",
    "❤‍🔥",
    "🦄",
  ];

  const shuffled = emojis.sort(() => Math.random() - 0.5);

  for (const emoji of shuffled) {
    try {
      await ctx.react(emoji);
      return;
    } catch (err) {
      if (
        err instanceof GrammyError &&
        err.description?.includes("REACTION_NOT_ALLOWED")
      ) {
        continue;
      } else {
        break;
      }
    }
  }
}
