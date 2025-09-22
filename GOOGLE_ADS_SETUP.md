# Google Ads and Analytics Setup Guide

This guide explains how to set up Google AdSense and Google Analytics for your AI Teammate Generator application.

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google AdSense Configuration
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx

# Google Analytics Configuration (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Google AdSense Setup

### 1. Create Google AdSense Account
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up or sign in with your Google account
3. Add your website and complete the verification process
4. Wait for approval (can take 24-48 hours)

### 2. Get Your Publisher ID
1. Once approved, go to your AdSense dashboard
2. Navigate to **Account** → **Account Information**
3. Copy your Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)
4. Add it to your environment variables as `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`

### 3. Create Ad Units
1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **+ New ad unit**
3. Create different ad units for different placements:
   - **Header Ad**: Banner (728x90 or responsive)
   - **Sidebar Ad**: Medium Rectangle (300x250)
   - **Content Ad**: Large Rectangle (336x280 or responsive)
   - **Bottom Ad**: Banner (728x90 or responsive)

### 4. Update Ad Slot IDs
Edit `/components/GoogleAds.tsx` and replace the placeholder ad slot IDs:

```typescript
// Replace these with your actual ad slot IDs from AdSense
export function HeaderAd({ className }: { className?: string }) {
  return (
    <GoogleAd
      adSlot="1234567890" // Replace with your header ad slot ID
      adFormat="horizontal"
      className={className}
      style={{ display: 'block', width: '100%', height: '90px' }}
    />
  );
}
```

## Google Analytics Setup (Optional)

### 1. Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property for your website
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Add to Environment
Add the Measurement ID to your `.env.local`:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Ad Placement Strategy

### Current Placements
1. **Header Ad**: Top of the page for maximum visibility
2. **Sidebar Ad**: Right column for persistent visibility
3. **Content Ads**: Between content sections for better engagement
4. **Bottom Ad**: Footer area for additional revenue

### Best Practices
- Don't overwhelm users with too many ads
- Ensure ads don't interfere with core functionality
- Use responsive ad formats for mobile compatibility
- Test different placements to optimize revenue

## Analytics Tracking

The application includes built-in visitor analytics that track:
- Total visitors (unique)
- Daily visitors
- Active users (real-time)
- Generated teammates count
- Generated images count

### Analytics Database Tables
- `visitor_tracking`: Tracks unique visitors and page views
- `user_sessions`: Manages active user sessions
- `image_generation_history`: Tracks usage statistics

### Privacy Considerations
- No personal data is collected without consent
- IP addresses are anonymized
- Visitors can opt out of tracking
- GDPR compliant (add cookie consent if targeting EU users)

## Revenue Optimization Tips

1. **Ad Placement**: Test different positions for better CTR
2. **Content Quality**: High-quality content improves ad relevance
3. **User Experience**: Don't sacrifice UX for ad revenue
4. **Mobile Optimization**: Ensure ads work well on mobile devices
5. **Analytics**: Monitor performance and adjust accordingly

## Troubleshooting

### Ads Not Showing
1. Check if `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` is set correctly
2. Verify AdSense account is approved
3. Check browser's ad blocker
4. Ensure ad slot IDs are correct
5. Check browser console for errors

### Low Ad Revenue
1. Improve content quality and user engagement
2. Optimize ad placements
3. Increase website traffic
4. Target high-value keywords
5. Consider ad format variations

## Development vs Production

- Ads are disabled in development mode
- Mock analytics data is used when database is unavailable
- Test thoroughly in production environment
- Monitor performance and user feedback

## Legal Considerations

1. **Privacy Policy**: Update to mention ad tracking
2. **Cookie Consent**: Add for EU compliance (GDPR)
3. **Terms of Service**: Include ad-related terms
4. **AdSense Policies**: Ensure compliance with Google's policies

## Support

For issues with:
- **Google AdSense**: Contact Google AdSense support
- **Analytics Tracking**: Check database connections and API endpoints
- **Implementation**: Review code comments and documentation