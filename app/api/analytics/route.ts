import { NextResponse } from 'next/server';
import { computeAnalyticsStats, recordVisitorEvent, RecordEventPayload } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// GET: Retrieve analytics statistics and unpurchased visitor list
export async function GET() {
  try {
    const stats = computeAnalyticsStats();
    return NextResponse.json({ success: true, stats }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    console.error('Error fetching analytics stats:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch analytics' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST: Receive client tracking beacons (pageviews, heartbeats, product views, purchases)
export async function POST(request: Request) {
  try {
    const body: RecordEventPayload = await request.json();

    if (!body || !body.visitorId) {
      return NextResponse.json(
        { success: false, error: 'Visitor ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const session = recordVisitorEvent(body);
    return NextResponse.json({ success: true, session }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    console.error('Error recording analytics beacon:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record event' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
