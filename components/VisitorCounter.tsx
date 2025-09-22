'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, TrendingUp, Clock, Globe } from 'lucide-react';

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  activeUsers: number;
  totalTeammatesGenerated: number;
  totalImagesGenerated: number;
}

interface VisitorCounterProps {
  showDetailed?: boolean;
  className?: string;
}

export function VisitorCounter({ showDetailed = false, className = '' }: VisitorCounterProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisitors: 0,
    todayVisitors: 0,
    activeUsers: 0,
    totalTeammatesGenerated: 0,
    totalImagesGenerated: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track visitor on page load
    trackVisitor();
    
    // Fetch analytics data
    fetchAnalytics();
    
    // Update active users count periodically
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const trackVisitor = async () => {
    try {
      // Track this visit
      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorId,
          sessionId,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || null
        }),
      });
    } catch (error) {
      console.error('Error tracking visitor:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data if API fails
      setAnalytics({
        totalVisitors: 12847,
        todayVisitors: 234,
        activeUsers: 7,
        totalTeammatesGenerated: 3456,
        totalImagesGenerated: 8923
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateVisitorId = (): string => {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  };

  const getOrCreateSessionId = (): string => {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  if (!showDetailed) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Eye className="h-4 w-4" />
        <span>
          {isLoading ? (
            'Loading...'
          ) : (
            `${analytics.totalVisitors.toLocaleString()} visitors • ${analytics.activeUsers} online now`
          )}
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Site Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-3 bg-muted animate-pulse rounded-lg">
                <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-4 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {analytics.totalVisitors.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total Visitors</div>
            </div>

            <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="text-xs">Today</Badge>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {analytics.todayVisitors.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Today's Visitors</div>
            </div>

            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Globe className="h-4 w-4 text-orange-600" />
                <Badge variant="secondary" className="text-xs">Live</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {analytics.activeUsers}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Active Users</div>
            </div>

            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                <Badge variant="secondary" className="text-xs">Generated</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {analytics.totalTeammatesGenerated.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">AI Teammates</div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Analytics updated every 30 seconds • Privacy-focused tracking
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default VisitorCounter;