import fs from "fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import path, { basename, join } from "path";
import { readFile, readdir, rename } from "fs/promises";

/**
 * Generates a "Guess the Country" PNG image based on a map silhouette.
 * @param {string} mapImagePath - Path to the source map PNG
 * @param {Buffer} fontData - Buffer containing the font file
 * @param {string} outputFileName - Name of the file to save in the same directory
 */
async function generateGuessMapCard(
  mapImagePath,
  fontData,
  outputFileName = "guess_card.png",
) {
  try {
    // Read the map image and convert to base64
    const mapBuffer = fs.readFileSync(mapImagePath);
    const mapBase64 = mapBuffer.toString("base64");

    // Satori Configuration with the requested #01193d and #5fa646 theme
    const svg = await satori(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 900,
          height: 600,
          background: "linear-gradient(145deg, #01193d 0%, #000c1d 100%)",
          color: "white",
          position: "relative",
          padding: "10px", // Minimal padding to maximize map area
          overflow: "hidden",
        }}
      >
        {/* Background Grids/Patterns */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: "radial-gradient(#5fa646 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            display: "flex",
          }}
        />

        {/* Header - Reduced font size to make room for the map */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "15px",
            marginBottom: "5px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "44px", // Decreased from 64px
              fontWeight: "900",
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            Guess the Country
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "8px",
              height: "3px",
              width: "80px",
              backgroundColor: "#5fa646",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Maximized Map Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Extremely Large Glow behind map */}
          <div
            style={{
              position: "absolute",
              width: "700px",
              height: "700px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(95, 166, 70, 0.1) 0%, transparent 75%)",
              display: "flex",
            }}
          />

          <img
            src={`data:image/png;base64,${mapBase64}`}
            style={{
              maxWidth: "700px",
              maxHeight: "420px",
              objectFit: "contain",
              display: "flex",
              filter:
                "invert(61%) sepia(38%) saturate(543%) hue-rotate(61deg) brightness(92%) contrast(88%)",
            }}
          />
        </div>
      </div>,
      {
        width: 900,
        height: 600,
        fonts: [
          {
            name: "Roboto",
            data: fontData,
            weight: 900,
            style: "normal",
          },
        ],
      },
    );

    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 900,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Save in the same directory as this script
    fs.writeFileSync(outputFileName, pngBuffer);

    console.log(`Success: Image saved to ${outputFileName}`);
  } catch (error) {
    console.error("Error generating map card:", error);
  }
}

// Execution Logic
const fontPath = join(process.cwd(), "./src/fonts/roboto.ttf");
const fontData = await readFile(fontPath);

const countriesDir = join(process.cwd(), "src/data/countries");

async function processMaps() {
  const files = await readdir(countriesDir);

  const pngFiles = files.filter(
    (f) => f.endsWith(".png") && !f.endsWith("-raw.png"),
  );

  for (const file of pngFiles) {
    const name = basename(file, ".png");

    const originalPath = join(countriesDir, file);
    const rawPath = join(countriesDir, `${name}-raw.png`);
    const outputPath = join(countriesDir, `${name}.png`);

    // rename original -> -raw
    await rename(originalPath, rawPath);

    // generate processed image
    await generateGuessMapCard(rawPath, fontData, outputPath);

    console.log(`Processed ${name}`);
  }
}

await processMaps();
