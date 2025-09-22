'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleAd({ 
  adSlot, 
  adFormat = 'auto', 
  style = { display: 'block' },
  className = '',
  responsive = true
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Check if Google AdSense script is loaded
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error loading Google Ad:', error);
      }
    }
  }, []);

  // Don't render ads in development or if no ad slot is provided
  if (process.env.NODE_ENV === 'development' || !adSlot || !process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
    return (
      <Card className={`${className} border-dashed border-gray-300`}>
        <CardContent className="p-6 text-center text-gray-500">
          <div className="text-sm font-medium">Advertisement Space</div>
          <div className="text-xs mt-1">
            {!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID 
              ? 'Google AdSense ID not configured' 
              : 'Ads disabled in development'
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Predefined ad components for common placements
export function HeaderAd({ className }: { className?: string }) {
  return (
    <GoogleAd
      adSlot="1234567890" // Replace with your actual ad slot
      adFormat="horizontal"
      className={className}
      style={{ display: 'block', width: '100%', height: '90px' }}
    />
  );
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <GoogleAd
      adSlot="1234567891" // Replace with your actual ad slot
      adFormat="vertical"
      className={className}
      style={{ display: 'block', width: '300px', height: '250px' }}
    />
  );
}

export function ContentAd({ className }: { className?: string }) {
  return (
    <GoogleAd
      adSlot="1234567892" // Replace with your actual ad slot
      adFormat="rectangle"
      className={className}
      style={{ display: 'block', width: '100%', height: '280px' }}
    />
  );
}

export function BottomAd({ className }: { className?: string }) {
  return (
    <GoogleAd
      adSlot="1234567893" // Replace with your actual ad slot
      adFormat="horizontal"
      className={className}
      style={{ display: 'block', width: '100%', height: '100px' }}
    />
  );
}