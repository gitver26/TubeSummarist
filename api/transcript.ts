export const config = {
  runtime: 'edge',
};

interface TranscriptSegment {
  text: string;
  start: number;
  dur: number;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchTranscript(videoId: string): Promise<string> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const response = await fetch(watchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch YouTube page');
  }

  const html = await response.text();

  const captionMatch = html.match(/"captions":\s*(\{[^}]+?"playerCaptionsTracklistRenderer"[^}]+?\})/);
  if (!captionMatch) {
    const noCaptionsMatch = html.match(/"playabilityStatus":\s*\{[^}]*"reason":\s*"([^"]+)"/);
    if (noCaptionsMatch) {
      throw new Error(`Video unavailable: ${noCaptionsMatch[1]}`);
    }
    throw new Error('No captions available for this video');
  }

  const captionsDataMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
  if (!captionsDataMatch) {
    throw new Error('No caption tracks found');
  }

  let captionTracks;
  try {
    captionTracks = JSON.parse(captionsDataMatch[1]);
  } catch {
    throw new Error('Failed to parse caption data');
  }

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error('No caption tracks available');
  }

  const englishTrack = captionTracks.find(
    (track: any) => track.languageCode === 'en' || track.languageCode?.startsWith('en')
  ) || captionTracks[0];

  const captionUrl = englishTrack.baseUrl;
  if (!captionUrl) {
    throw new Error('No caption URL found');
  }

  const captionResponse = await fetch(captionUrl);
  if (!captionResponse.ok) {
    throw new Error('Failed to fetch captions');
  }

  const captionXml = await captionResponse.text();

  const textSegments: string[] = [];
  const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
  
  for (const match of textMatches) {
    let text = match[1];
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, ' ')
      .trim();
    
    if (text) {
      textSegments.push(text);
    }
  }

  if (textSegments.length === 0) {
    throw new Error('No transcript text found');
  }

  return textSegments.join(' ');
}

async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return data.title || 'Unknown Title';
    }
  } catch {
    // Fall through
  }
  return 'Unknown Title';
}

export default async function handler(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing url parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return new Response(
      JSON.stringify({ error: 'Invalid YouTube URL' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    const [transcript, title] = await Promise.all([
      fetchTranscript(videoId),
      fetchVideoTitle(videoId),
    ]);

    return new Response(
      JSON.stringify({ transcript, title, videoId }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch transcript' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
