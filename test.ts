import { readFile, writeFile } from "fs/promises";

type Country = {
  code: string;
  name: string;
  aliases: string[];
  flag: string;
  lat: number;
  lng: number;
  capital?: string;
  region: string;
  population: number;

  borders?: string[];
  unMember?: boolean;
  area?: number;
  carSide?: "left" | "right";
  continents?: string[];
  startOfWeek?: string;
};

const FILE = "./src/data/countries.json";

async function main() {
  const raw = await readFile(FILE, "utf8");
  const countries: Country[] = JSON.parse(raw);

  console.log(`Loaded ${countries.length} countries`);

  // build cca3 -> cca2 map
  const allRes = await fetch(
    "https://restcountries.com/v3.1/all?fields=cca2,cca3",
  );

  const all = await allRes.json();

  if (!Array.isArray(all)) {
    throw new Error("Invalid response from /all endpoint");
  }

  const cca3to2 = new Map<string, string>();

  for (const c of all) {
    if (c.cca3 && c.cca2) {
      cca3to2.set(c.cca3, c.cca2);
    }
  }

  const updated = await Promise.all(
    countries.map(async (country) => {
      try {
        const res = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(
            country.name,
          )}`,
        );

        const results = await res.json();

        if (!Array.isArray(results)) {
          console.warn(`Unexpected result for ${country.name}`);
          return country;
        }

        // pick the correct country using cca2
        const data =
          results.find((c: any) => c.cca2 === country.code) ?? results[0];

        const borders3: string[] = Array.isArray(data.borders)
          ? data.borders
          : [];

        const borders2 = borders3
          .map((b: string) => cca3to2.get(b))
          .filter(Boolean) as string[];

        console.log(`Updated ${country.name}`);

        return {
          ...country,
          borders: borders2,
          unMember: data.unMember ?? false,
          area: data.area,
          carSide: data.car?.side,
          continents: data.continents ?? [],
          startOfWeek: data.startOfWeek,
        };
      } catch (err) {
        console.warn(`Failed to update ${country.name}`);
        return country;
      }
    }),
  );

  await writeFile(FILE, JSON.stringify(updated, null, 2));

  console.log("Countries updated successfully");
}

main();
