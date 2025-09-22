import { NextRequest, NextResponse } from 'next/server';
import { eq, gte, sql, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { visitorTracking, userSessions, generatedImages, imageGenerationHistory } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // Get total unique visitors (all time)
    const totalVisitorsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${visitorTracking.visitorId})` })
      .from(visitorTracking);
    
    const totalVisitors = totalVisitorsResult[0]?.count || 0;

    // Get today's unique visitors
    const todayVisitorsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${visitorTracking.visitorId})` })
      .from(visitorTracking)
      .where(gte(visitorTracking.visitTime, today.toISOString()));
    
    const todayVisitors = todayVisitorsResult[0]?.count || 0;

    // Get active users (sessions active in last 5 minutes)
    const activeUsersResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userSessions.sessionId})` })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.isActive, true),
          gte(userSessions.lastActivity, fiveMinutesAgo.toISOString())
        )
      );
    
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get total teammates generated (from image generation history)
    const totalTeammatesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(imageGenerationHistory)
      .where(eq(imageGenerationHistory.success, true));
    
    const totalTeammatesGenerated = totalTeammatesResult[0]?.count || 0;

    // Get total images generated
    const totalImagesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(generatedImages)
      .where(eq(generatedImages.status, 'completed'));
    
    const totalImagesGenerated = totalImagesResult[0]?.count || 0;

    // Mark sessions as inactive if they haven't been active for more than 5 minutes
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(
        and(
          eq(userSessions.isActive, true),
          sql`${userSessions.lastActivity} < ${fiveMinutesAgo.toISOString()}`
        )
      );

    const analytics = {
      totalVisitors,
      todayVisitors,
      activeUsers,
      totalTeammatesGenerated,
      totalImagesGenerated,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    
    // Return mock data if database fails
    return NextResponse.json({
      totalVisitors: 12847,
      todayVisitors: 234,
      activeUsers: 7,
      totalTeammatesGenerated: 3456,
      totalImagesGenerated: 8923,
      lastUpdated: new Date().toISOString(),
      error: 'Using mock data - database unavailable'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to manually refresh analytics or trigger cleanup
    const body = await request.json();
    const { action } = body;

    if (action === 'cleanup') {
      // Clean up old sessions (older than 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(sql`${userSessions.lastActivity} < ${oneDayAgo.toISOString()}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Analytics cleanup completed' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Unknown action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Error in analytics POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}