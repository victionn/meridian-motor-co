import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDealerComment } from "../dealer-comment";
import { decodeCsv, parseEasyCarsCsv, tidyMake, tidyModel } from "../easycars-csv";

const bytes = readFileSync(new URL("../__fixtures__/easycars-sample.csv", import.meta.url));
const csv = decodeCsv(bytes);
const feed = parseEasyCarsCsv(csv);
const car = (id: string) => feed.vehicles.find((v) => v.id === id)!;
const header = csv.split("\r\n")[0];
/** A one-row CSV: the fixture's Golf with some columns replaced. */
const withRow = (changes: Record<string, string>) => {
  const columns = header.split(",");
  const golf = feed.raw["13441"];
  const cells = columns.map((c) => `"${(changes[c] ?? golf[c]).replaceAll('"', '""')}"`);
  return `${header}\r\n${cells.join(",")}\r\n`;
};

describe("decoding", () => {
  it("strips the UTF-8 BOM", () => {
    expect(bytes.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
    expect(csv.startsWith("StockNumber,")).toBe(true);
  });

  it("falls back to Windows-1252 when the bytes are not valid UTF-8", () => {
    expect(decodeCsv(Buffer.from([0x43, 0x61, 0x66, 0xe9]))).toBe("Café");
  });
});

describe("EasyCars CSV mapping", () => {
  it("maps every fixture row and keeps the raw row for debugging", () => {
    expect(feed.totalRows).toBe(10);
    expect(feed.vehicles).toHaveLength(10);
    expect(feed.invalid).toEqual([]);
    expect(feed.raw["13441"].GearType).toBe("Sports Automatic Dual Clutch");
  });

  it("uses the stock number as id and marks every listed car available", () => {
    expect(car("13441")).toMatchObject({ id: "13441", stockNumber: "13441", status: "available", year: 2023, make: "Volkswagen", model: "Golf", variant: "GTI" });
    expect(feed.vehicles.every((v) => v.status === "available")).toBe(true);
  });

  it("takes the special price when it is lower, and treats a blank price as price-on-application", () => {
    expect(feed.raw["13171"]).toMatchObject({ Price: "498800.0000", SpecialPrice: "459000.0000" });
    expect(car("13171").price).toBe(459000);
    expect(car("13441").price).toBe(41800);
    expect(car("13593").price).toBeNull();
  });

  it("parses prices and odometers written with symbols and separators", () => {
    const [v] = parseEasyCarsCsv(withRow({ Price: "$41,800.00", SpecialPrice: " ", Odometer: "17,748" })).vehicles;
    expect(v.price).toBe(41800);
    expect(v.odometer).toBe(17748);
    expect(parseEasyCarsCsv(withRow({ Price: "0", SpecialPrice: "" })).vehicles[0].price).toBeNull();
    expect(parseEasyCarsCsv(withRow({ Price: "POA", SpecialPrice: "" })).vehicles[0].price).toBeNull();
  });

  it("reads miles from the write-up when EasyCars' IsMiles flag is not set", () => {
    expect(feed.raw["13171"].IsMiles).toBe("False");
    expect(car("13171")).toMatchObject({ odometer: 12800, odometerUnit: "mi" });
    expect(feed.milesFromDescription).toEqual(["13171"]);
    expect(car("13441").odometerUnit).toBe("km");
    expect(parseEasyCarsCsv(withRow({ IsMiles: "True" })).vehicles[0].odometerUnit).toBe("mi");
  });

  it("normalises makes, models and the filter vocabulary", () => {
    expect(car("13171")).toMatchObject({ make: "Ferrari", model: "Testarossa", colour: "Red" });
    expect(car("13496")).toMatchObject({ make: "Land Rover", model: "Discovery 4" });
    expect(car("13376").make).toBe("Infiniti");
    expect(car("13441")).toMatchObject({ transmission: "Sports Automatic DCT", fuel: "Premium ULP", drive: "FWD", body: "Hatchback", doors: 5 });
    expect(car("13556").transmission).toBe("CVT");
    expect(car("13073").drive).toBe("4X4");
    expect(car("12825").body).toBe("Sedan"); // SALOON in the feed
    expect(tidyMake("BMW")).toBe("BMW");
    expect(tidyMake("MERCEDES-BENZ")).toBe("Mercedes-Benz");
    expect(tidyModel("RS7")).toBe("RS7");
  });

  it("falls back rather than failing when EasyCars leaves descriptive fields blank", () => {
    expect(car("13171")).toMatchObject({ body: "Other", transmission: "Unknown", fuel: "Unknown" });
    expect(car("13171").drive).toBeUndefined();
    expect(car("13171").engine).toBeUndefined();
  });

  it("builds an engine summary from size, cylinders and power", () => {
    expect(car("13441").engine).toBe("2.0L · 4-cylinder · 180 kW");
    expect(car("7414").engine).toBe("5.5L · 12-cylinder · 325 kW");
  });

  it("turns the dealer comment into paragraphs and grouped features", () => {
    const golf = car("13441");
    expect(golf.description).not.toMatch(/<br|&amp;|BUY WITH CONFIDENCE|Established in 2012/);
    expect(golf.description.split("\n\n")).toHaveLength(3);
    expect(golf.featureGroups?.map((g) => [g.title, g.items.length])).toEqual([
      ["Factory Luxury Package", 7],
      ["GTI Performance and Styling", 13],
      ["Premium Technology and Safety", 13],
    ]);
    expect(golf.features).toHaveLength(33);
    expect(golf.features).toContain("Wireless Apple CarPlay and Android Auto");
    expect(car("13171").featureGroups).toEqual([]);
  });
});

describe("bad input", () => {
  it("rejects an empty file and a file with the wrong columns", () => {
    expect(() => parseEasyCarsCsv(`${header}\r\n`)).toThrow(/no rows/);
    expect(() => parseEasyCarsCsv("a,b\r\n1,2\r\n")).toThrow(/missing expected columns: StockNumber/);
  });

  it("skips an invalid row but keeps the rest", () => {
    const lines = csv.trimEnd().split("\r\n");
    const badYear = withRow({ StockNumber: "99999", Year: "soon" }).split("\r\n")[1];
    // Rows contain no embedded newlines once <br /> is used, so appending a line appends a row.
    const result = parseEasyCarsCsv([...lines, badYear].join("\r\n"));
    expect(result.vehicles).toHaveLength(10);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0]).toMatchObject({ row: 12, stockNumber: "99999" });
  });

  it("rejects the whole feed when more than a fifth of the rows are invalid", () => {
    const bad = (n: number) => withRow({ StockNumber: `9000${n}`, Year: "" }).split("\r\n")[1];
    expect(() => parseEasyCarsCsv([header, withRow({}).split("\r\n")[1], bad(1), bad(2)].join("\r\n"))).toThrow(/2 of 3 rows are invalid/);
  });

  it("keeps the last row for a duplicated stock number", () => {
    const first = withRow({ Price: "100" }).split("\r\n")[1];
    const second = withRow({ Price: "200" }).split("\r\n")[1];
    const result = parseEasyCarsCsv([header, first, second].join("\r\n"));
    expect(result.vehicles).toHaveLength(1);
    expect(result.vehicles[0].price).toBe(200);
    expect(result.duplicates).toEqual(["13441"]);
  });

  it("handles quoted fields with commas, quotes and line breaks", () => {
    const [v] = parseEasyCarsCsv(withRow({ AdvDescription: 'Clean, "one owner" car.\nSecond line.<br />FACTORY OPTIONS<br />- Sunroof, panoramic<br />- Heated seats' })).vehicles;
    expect(v.description).toBe('Clean, "one owner" car.\n\nSecond line.');
    expect(v.featureGroups).toEqual([{ title: "Factory Options", items: ["Sunroof, panoramic", "Heated seats"] }]);
  });
});

describe("dealer comment parsing", () => {
  it("accepts dash, bullet and numbered lists and 'Features include:' headings", () => {
    const { description, featureGroups } = parseDealerComment("A tidy example.<br />Features include:<br />Leather seats<br />Reverse camera<br />It drives well.<br />Factory Options:<br />1. Rear seat<br />• Tow bar");
    expect(description).toBe("A tidy example.\n\nIt drives well.");
    expect(featureGroups).toEqual([
      { title: "Features", items: ["Leather seats", "Reverse camera"] },
      { title: "Factory Options", items: ["Rear seat", "Tow bar"] },
    ]);
  });

  it("drops showroom boilerplate and everything after a closing heading", () => {
    const { description, features } = parseDealerComment("Lovely car.<br />Interstate buyers welcome. Finance available.<br />BUY WITH CONFIDENCE<br />- Extended warranty options available");
    expect(description).toBe("Lovely car.");
    expect(features).toEqual([]);
  });
});
