import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { lat, lng } = await request.json();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    // Search for print/sign/marketing vendors nearby
    const queries = ["print shop", "sign shop vinyl banner"];
    const seen = new Map<string, object>();

    await Promise.all(
      queries.map(async (q) => {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&location=${lat},${lng}&radius=10000&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        for (const p of (data.results ?? []).slice(0, 5)) {
          if (!seen.has(p.place_id)) {
            seen.set(p.place_id, {
              placeId: p.place_id,
              name: p.name,
              address: p.formatted_address ?? p.vicinity ?? "",
              rating: p.rating ?? null,
              ratingsTotal: p.user_ratings_total ?? 0,
              lat: p.geometry?.location?.lat,
              lng: p.geometry?.location?.lng,
            });
          }
        }
      })
    );

    // Fetch phone + website for top 5 results
    const top = Array.from(seen.values()).slice(0, 5) as Array<Record<string, unknown>>;

    const detailed = await Promise.all(
      top.map(async (place) => {
        try {
          const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.placeId}&fields=formatted_phone_number,website,opening_hours&key=${apiKey}`;
          const res = await fetch(url);
          const data = await res.json();
          const r = data.result ?? {};
          return {
            ...place,
            phone: r.formatted_phone_number ?? null,
            website: r.website ?? null,
            openNow: r.opening_hours?.open_now ?? null,
          };
        } catch {
          return place;
        }
      })
    );

    return NextResponse.json({ vendors: detailed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
