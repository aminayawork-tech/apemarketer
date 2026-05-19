import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { lat, lng } = await request.json();

  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YELP_API_KEY not configured. Get a free key at https://www.yelp.com/developers" },
      { status: 500 }
    );
  }

  const categories = ["printing", "signmaking", "graphicdesign", "bannerads"];

  try {
    const res = await fetch(
      `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&categories=${categories.join(",")}&radius=10000&sort_by=rating&limit=20`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.description ?? "Yelp API error" },
        { status: res.status }
      );
    }

    const data = await res.json();

    const vendors = (data.businesses ?? [])
      .filter((b: { rating: number }) => b.rating >= 4.5)
      .slice(0, 6)
      .map((b: {
        name: string;
        rating: number;
        review_count: number;
        location: { display_address: string[] };
        display_phone: string;
        phone: string;
        url: string;
        is_closed: boolean;
        distance: number;
        image_url: string;
      }) => ({
        name: b.name,
        rating: b.rating,
        reviewCount: b.review_count,
        address: b.location.display_address.join(", "),
        phone: b.display_phone,
        phoneRaw: b.phone,
        url: b.url,
        isOpen: !b.is_closed,
        distance: Math.round(b.distance * 0.000621371 * 10) / 10, // meters → miles
      }));

    return NextResponse.json({ vendors });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
