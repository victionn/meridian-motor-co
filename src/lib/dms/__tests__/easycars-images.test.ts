import { describe, expect, it } from "vitest";
import { earliestPhotoDate, groupImages, imageKey, type ImageManifestEntry, parseListingDate, planImages } from "../easycars-images";

const file = (name: string, size = 100, modified = "Feb 08 2026") => ({ name, size, modified });
const now = new Date("2026-11-11T05:00:00Z");

describe("grouping photos by stock number", () => {
  const groups = groupImages([file("13171_10.jpg"), file("13171_2.jpg"), file("13171_1.JPG"), file("5261_5.jpg"), file("5261_1.jpeg"), file("readme.txt"), file("13171.jpg"), file("AB_12_3.jpg")]);

  it("orders by index numerically, not alphabetically, and tolerates gaps", () => {
    expect(groups.get("13171")!.map((f) => f.index)).toEqual([1, 2, 10]);
    expect(groups.get("5261")!.map((f) => f.index)).toEqual([1, 5]);
  });

  it("ignores files that do not follow [StockNumber]_[index].jpg and allows underscores in stock numbers", () => {
    expect([...groups.keys()].sort()).toEqual(["13171", "5261", "AB_12"]);
  });
});

describe("deciding which photos to copy", () => {
  const stored: ImageManifestEntry[] = [
    { index: 1, ftpSize: 100, ftpModified: "Feb 08 2026", url: "https://store/1" },
    { index: 2, ftpSize: 200, ftpModified: "Feb 08 2026", url: "https://store/2" },
  ];
  const onServer = (files: ReturnType<typeof file>[]) => groupImages(files).get("13171");

  it("keeps the stored photos when the server has none for the car (they may have been purged)", () => {
    expect(planImages(stored, undefined)).toBe("keep-stored");
    expect(planImages(stored, [])).toBe("keep-stored");
  });

  it("copies nothing when sizes and dates match", () => {
    const plan = planImages(stored, onServer([file("13171_1.jpg", 100), file("13171_2.jpg", 200)]));
    expect(plan).toEqual({ keep: stored, fetch: [] });
  });

  it("copies new photos and ones whose size or date changed", () => {
    const plan = planImages(stored, onServer([file("13171_1.jpg", 100), file("13171_2.jpg", 250), file("13171_3.jpg", 300), file("13171_4.jpg", 100, "Nov 09 11:00")]));
    if (plan === "keep-stored") throw new Error("expected a plan");
    expect(plan.keep.map((e) => e.index)).toEqual([1]);
    expect(plan.fetch.map((f) => f.index)).toEqual([2, 3, 4]);
    const redated = planImages(stored, onServer([file("13171_1.jpg", 100, "Nov 09 11:00")]));
    expect(redated !== "keep-stored" && redated.fetch.map((f) => f.index)).toEqual([1]);
  });

  it("copies everything for a car with nothing stored", () => {
    const plan = planImages([], onServer([file("13171_1.jpg"), file("13171_2.jpg")]));
    expect(plan !== "keep-stored" && plan.fetch).toHaveLength(2);
  });
});

describe("storage keys", () => {
  it("are deterministic and change with the content", () => {
    const a = imageKey("13171", 1, Buffer.from("one"));
    expect(a).toMatch(/^vehicles\/13171\/1-[0-9a-f]{8}\.jpg$/);
    expect(imageKey("13171", 1, Buffer.from("one"))).toBe(a);
    expect(imageKey("13171", 1, Buffer.from("two"))).not.toBe(a);
  });
});

describe("listing dates", () => {
  it("parses dates with a year", () => {
    expect(parseListingDate("Feb 08 2026", now)?.toISOString()).toBe("2026-02-08T00:00:00.000Z");
    expect(parseListingDate("Apr  1 2025", now)?.toISOString()).toBe("2025-04-01T00:00:00.000Z");
  });

  it("gives a year-less date this year, or last year if that would be in the future", () => {
    expect(parseListingDate("Jul 29 05:01", now)?.toISOString()).toBe("2026-07-29T05:01:00.000Z");
    expect(parseListingDate("Dec 20 09:30", now)?.toISOString()).toBe("2025-12-20T09:30:00.000Z");
  });

  it("accepts ISO timestamps and rejects anything else", () => {
    expect(parseListingDate("2026-03-01T10:00:00.000Z", now)?.toISOString()).toBe("2026-03-01T10:00:00.000Z");
    expect(parseListingDate("yesterday", now)).toBeUndefined();
    expect(parseListingDate("", now)).toBeUndefined();
  });

  it("uses the earliest photo as the arrival date", () => {
    expect(earliestPhotoDate([file("a_1.jpg", 1, "Jul 29 05:01"), file("a_2.jpg", 1, "Feb 08 2026"), file("a_3.jpg", 1, "??")], now)?.toISOString()).toBe("2026-02-08T00:00:00.000Z");
    expect(earliestPhotoDate(undefined, now)).toBeUndefined();
  });
});
