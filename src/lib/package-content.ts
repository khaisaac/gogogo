const DETAIL_KEY = "[DETAIL]";
const HIGHLIGHTS_KEY = "[HIGHLIGHTS]";
const ITINERARY_KEY = "[ITINERARY]";
const GALLERY_KEY = "[GALLERY]";
const INCLUDE_KEY = "[INCLUDE]";
const EXCLUDE_KEY = "[EXCLUDE]";
const WHAT_TO_BRING_KEY = "[WHAT_TO_BRING]";
const NOTES_KEY = "[NOTES]";
const SECTION_MARKER_PATTERN =
  /^\[(DETAIL|HIGHLIGHTS|ITINERARY|INCLUDE|EXCLUDE|WHAT_TO_BRING|NOTES|GALLERY)\]/;

export type ItineraryDay = {
  title: string;
  schedule: string[];
  overview: string[];
};

export type PackageContentParts = {
  detail: string;
  highlights: string;
  itinerary: ItineraryDay[];
  gallery: string[];
  include: string;
  exclude: string;
  whatToBring: string;
  notes: string;
};

function toLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toLineArray(value: unknown) {
  if (typeof value === "string") {
    return toLines(value);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function cleanSectionText(value: string) {
  const lines: string[] = [];

  for (const line of value.split("\n")) {
    const trimmed = line.trim();

    if (SECTION_MARKER_PATTERN.test(trimmed)) {
      break;
    }

    if (trimmed) {
      lines.push(trimmed);
    }
  }

  return lines.join("\n");
}

function parseGallerySource(value: string) {
  const source = value.trim();

  if (!source) return [] as string[];

  // Support legacy JSON array format: ["url1", "url2"]
  try {
    const parsed = JSON.parse(source);
    if (Array.isArray(parsed)) {
      const urls = parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);

      if (urls.length > 0) {
        return Array.from(new Set(urls));
      }
    }
  } catch {
    // Continue to URL/text parsing below.
  }

  // Support mixed free-form text containing multiple URLs.
  const urlMatches = source.match(/https?:\/\/[^\s"'<>]+/g);
  if (urlMatches && urlMatches.length > 0) {
    return Array.from(
      new Set(
        urlMatches.map((item) => item.trim().replace(/,$/, "")).filter(Boolean),
      ),
    );
  }

  // Fallback: split by newline and comma.
  return Array.from(
    new Set(
      source
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeItineraryDay(
  value: unknown,
  index: number,
): ItineraryDay | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const schedule = toLineArray(
    value.schedule ?? value.steps ?? value.items ?? value.bullets,
  );
  const overview = toLineArray(value.overview ?? value.notes ?? value.details);

  if (!title && schedule.length === 0 && overview.length === 0) {
    return null;
  }

  return {
    title: title || `Day ${index + 1}`,
    schedule,
    overview,
  };
}

function parseItineraryText(value: string) {
  const source = value.trim();

  if (!source) {
    return [] as ItineraryDay[];
  }

  try {
    const parsed = JSON.parse(source);

    if (Array.isArray(parsed)) {
      return parsed
        .map((entry, index) => normalizeItineraryDay(entry, index))
        .filter((entry): entry is ItineraryDay => Boolean(entry));
    }
  } catch {
    // Fall back to legacy free-form text below.
  }

  return [
    {
      title: "Day 1",
      schedule: toLines(source),
      overview: [],
    },
  ];
}

export function parseItineraryInput(value: string | null | undefined) {
  if (typeof value !== "string") {
    return [] as ItineraryDay[];
  }

  return parseItineraryText(value);
}

export function serializePackageContent(parts: PackageContentParts) {
  const galleryText = parts.gallery
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");

  const itineraryText = JSON.stringify(
    parts.itinerary
      .map((item, index) => normalizeItineraryDay(item, index))
      .filter((item): item is ItineraryDay => Boolean(item)),
  );

  return [
    DETAIL_KEY,
    parts.detail.trim(),
    "",
    HIGHLIGHTS_KEY,
    parts.highlights.trim(),
    "",
    ITINERARY_KEY,
    itineraryText,
    "",
    INCLUDE_KEY,
    parts.include.trim(),
    "",
    EXCLUDE_KEY,
    parts.exclude.trim(),
    "",
    WHAT_TO_BRING_KEY,
    parts.whatToBring.trim(),
    "",
    NOTES_KEY,
    parts.notes.trim(),
    "",
    GALLERY_KEY,
    galleryText,
  ].join("\n");
}

export function parsePackageContent(
  value: string | null | undefined,
): PackageContentParts {
  const source = value || "";

  if (
    !source.includes(DETAIL_KEY) ||
    !source.includes(HIGHLIGHTS_KEY) ||
    !source.includes(ITINERARY_KEY)
  ) {
    return {
      detail: source,
      highlights: "",
      itinerary: [],
      gallery: [],
      include: "",
      exclude: "",
      whatToBring: "",
      notes: "",
    };
  }

  const detailStart = source.indexOf(DETAIL_KEY) + DETAIL_KEY.length;
  const highlightsStart = source.indexOf(HIGHLIGHTS_KEY);
  const itineraryStart = source.indexOf(ITINERARY_KEY);
  const includeStart = source.indexOf(INCLUDE_KEY);
  const excludeStart = source.indexOf(EXCLUDE_KEY);
  const whatToBringStart = source.indexOf(WHAT_TO_BRING_KEY);
  const notesStart = source.indexOf(NOTES_KEY);
  const galleryStart = source.indexOf(GALLERY_KEY);

  const detail = cleanSectionText(
    source.slice(detailStart, highlightsStart).trim(),
  );
  const highlights = source
    .slice(
      highlightsStart + HIGHLIGHTS_KEY.length,
      includeStart === -1 ? itineraryStart : includeStart,
    )
    .trim();
  const cleanedHighlights = cleanSectionText(highlights);

  const itineraryRaw =
    includeStart === -1
      ? galleryStart === -1
        ? source.slice(itineraryStart + ITINERARY_KEY.length).trim()
        : source
            .slice(itineraryStart + ITINERARY_KEY.length, galleryStart)
            .trim()
      : source
          .slice(itineraryStart + ITINERARY_KEY.length, includeStart)
          .trim();

  const itinerary = parseItineraryText(itineraryRaw);

  const include =
    includeStart === -1 || excludeStart === -1
      ? ""
      : cleanSectionText(
          source.slice(includeStart + INCLUDE_KEY.length, excludeStart).trim(),
        );

  const exclude =
    excludeStart === -1 || whatToBringStart === -1
      ? ""
      : cleanSectionText(
          source
            .slice(excludeStart + EXCLUDE_KEY.length, whatToBringStart)
            .trim(),
        );

  const whatToBring =
    whatToBringStart === -1 || notesStart === -1
      ? ""
      : cleanSectionText(
          source
            .slice(whatToBringStart + WHAT_TO_BRING_KEY.length, notesStart)
            .trim(),
        );

  const notes =
    notesStart === -1
      ? ""
      : cleanSectionText(
          source
            .slice(
              notesStart + NOTES_KEY.length,
              galleryStart === -1 ? source.length : galleryStart,
            )
            .trim(),
        );

  const gallerySource =
    galleryStart === -1
      ? ""
      : source.slice(galleryStart + GALLERY_KEY.length).trim();

  const gallery = parseGallerySource(gallerySource);

  return {
    detail,
    highlights: cleanedHighlights,
    itinerary,
    gallery,
    include,
    exclude,
    whatToBring,
    notes,
  };
}
