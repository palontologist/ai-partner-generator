import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { visitorTracking, userSessions } from '@/lib/db/schema';
import { z } from 'zod';

const trackingSchema = z.object({
  visitorId: z.string(),
  sessionId: z.string(),
  page: z.string(),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  referrer: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = trackingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid tracking data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { visitorId, sessionId, page, timestamp, userAgent, referrer } = validation.data;
    const visitTime = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get client IP (considering various proxy headers)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';

    // Check if this visitor has been tracked today
    const existingVisit = await db
      .select()
      .from(visitorTracking)
      .where(
        and(
          eq(visitorTracking.visitorId, visitorId),
          gte(visitorTracking.visitTime, today.toISOString())
        )
      )
      .limit(1);

    // Only insert if this is a new visitor for today
    if (existingVisit.length === 0) {
      await db.insert(visitorTracking).values({
        id: uuidv4(),
        visitorId,
        sessionId,
        ipAddress: clientIP,
        userAgent: userAgent || null,
        referrer: referrer || null,
        page,
        visitTime: visitTime.toISOString(),
      });
    }

    // Update or create session
    const existingSession = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionId, sessionId))
      .limit(1);

    if (existingSession.length === 0) {
      await db.insert(userSessions).values({
        id: uuidv4(),
        sessionId,
        visitorId,
        startTime: visitTime.toISOString(),
        lastActivity: visitTime.toISOString(),
        ipAddress: clientIP,
        userAgent: userAgent || null,
        isActive: true,
      });
    } else {
      // Update last activity
      await db
        .update(userSessions)
        .set({
          lastActivity: visitTime.toISOString(),
          isActive: true,
        })
        .where(eq(userSessions.sessionId, sessionId));
    }

    return NextResponse.json({ success: true, message: 'Visit tracked successfully' });

  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Get recent visits
    const recentVisits = await db
      .select()
      .from(visitorTracking)
      .where(gte(visitorTracking.visitTime, sinceDate.toISOString()))
      .orderBy(sql`${visitorTracking.visitTime} DESC`)
      .limit(100);

    return NextResponse.json({
      success: true,
      data: recentVisits,
      count: recentVisits.length,
    });

  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}