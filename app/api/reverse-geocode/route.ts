import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = body as { lat?: unknown; lng?: unknown };
  const lat = Number(payload.lat);
  const lng = Number(payload.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "invalid_coordinates" }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "out_of_range" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      String(lat),
    )}&lon=${encodeURIComponent(String(lng))}&accept-language=ar,en`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DASM-Stores/1.0 (signup geocode; https://stores.dasm.com.sa)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ city: null, region: null });
    }

    const data = (await response.json()) as {
      address?: Record<string, string>;
    };
    const address = data.address ?? {};
    const city = address.city || address.town || address.village || address.municipality || null;
    const region = address.state || address.region || address.county || null;

    return NextResponse.json({
      city: city || null,
      region: region || null,
    });
  } catch {
    return NextResponse.json({ city: null, region: null });
  }
}
