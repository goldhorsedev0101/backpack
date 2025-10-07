import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';

const QUICK_LINKS = {
  google: { ref: 'ATJ83zhbDzPELzIxPnZQHJaFp21HwU5Z0xnKVv_l7TwlcJrQTJF6B_Q8lQPzKLhHoLxKT_cqgQN3oHXVfwYM=s1600-w400', label: 'Tel Aviv Beach' },
  unsplash: { query: 'Barcelona skyline', label: 'Barcelona skyline' },
  pexels: { query: 'Paris Eiffel Tower', label: 'Paris Eiffel Tower' },
  wikimedia: { file: 'Sydney_Opera_House_-_Dec_2008.jpg', label: 'Sydney Opera House' },
};

export default function MediaDemo() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [source, setSource] = useState<string>('google');
  const [params, setParams] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<string>('');
  const [attribution, setAttribution] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const internalApiKey = import.meta.env.VITE_INTERNAL_API_KEY;

  const fetchImage = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    setAttribution(null);
    setMetadata(null);

    try {
      const queryParams = new URLSearchParams({
        source,
        ...params,
        lang: i18n.language,
      });

      const startTime = Date.now();
      const response = await fetch(`/api/media/proxy?${queryParams}`, {
        headers: { 'x-globemate-key': internalApiKey || '' }
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      const attributionHeader = response.headers.get('X-Attribution');
      const cacheHit = response.headers.get('X-Cache-Hit');
      const latencyMs = response.headers.get('X-Latency-Ms');

      if (attributionHeader) {
        try {
          setAttribution(JSON.parse(attributionHeader));
        } catch (e) {
          console.error('Failed to parse attribution:', e);
        }
      }

      setMetadata({
        latency: latencyMs || latency,
        cacheHit: cacheHit === 'true',
        contentType: response.headers.get('Content-Type'),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch image');
    } finally {
      setLoading(false);
    }
  };

  const applyQuickLink = (key: string) => {
    const link = QUICK_LINKS[key as keyof typeof QUICK_LINKS];
    setSource(key);
    setParams(link ? { [Object.keys(link)[0]]: Object.values(link)[0] as string } : {});
  };

  return (
    <div className={`container mx-auto py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="demo-title">
            Media Proxy Demo
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="demo-subtitle">
            Test media integration from multiple providers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <Card data-testid="demo-controls">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Select provider and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger data-testid="source-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Places</SelectItem>
                    <SelectItem value="unsplash">Unsplash</SelectItem>
                    <SelectItem value="pexels">Pexels</SelectItem>
                    <SelectItem value="wikimedia">Wikimedia Commons</SelectItem>
                    <SelectItem value="tripadvisor" disabled>TripAdvisor (Coming Soon)</SelectItem>
                    <SelectItem value="tbo" disabled>TBO (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {source === 'google' && (
                <div className="space-y-2">
                  <Label>Photo Reference</Label>
                  <Input
                    value={params.ref || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({ ...params, ref: e.target.value })}
                    placeholder="Enter photo reference..."
                    data-testid="input-ref"
                  />
                </div>
              )}

              {(source === 'unsplash' || source === 'pexels') && (
                <>
                  <div className="space-y-2">
                    <Label>ID (optional)</Label>
                    <Input
                      value={params.id || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({ ...params, id: e.target.value })}
                      placeholder="Photo ID..."
                      data-testid="input-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Query (optional)</Label>
                    <Input
                      value={params.query || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({ ...params, query: e.target.value })}
                      placeholder="Search query..."
                      data-testid="input-query"
                    />
                  </div>
                </>
              )}

              {source === 'wikimedia' && (
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <Input
                    value={params.file || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({ ...params, file: e.target.value })}
                    placeholder="e.g., Sydney_Opera_House_-_Dec_2008.jpg"
                    data-testid="input-file"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Max Width (optional)</Label>
                <Input
                  type="number"
                  value={params.maxwidth || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({ ...params, maxwidth: e.target.value })}
                  placeholder="1200"
                  data-testid="input-maxwidth"
                />
              </div>

              <Button
                onClick={fetchImage}
                disabled={loading}
                className="w-full"
                data-testid="fetch-btn"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Image
              </Button>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Quick Links:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(QUICK_LINKS).map(([key, { label }]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickLink(key)}
                      data-testid={`quick-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card data-testid="demo-results">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Image and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="error-alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {imageUrl && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imageUrl}
                      alt="Fetched from proxy"
                      className="w-full h-full object-cover"
                      data-testid="result-image"
                    />
                  </div>

                  {attribution && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Attribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <p><strong>Provider:</strong> {attribution.provider}</p>
                        {attribution.attributionText && (
                          <p><strong>Text:</strong> {attribution.attributionText}</p>
                        )}
                        {attribution.attributionUrl && (
                          <p>
                            <strong>URL:</strong>{' '}
                            <a
                              href={attribution.attributionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              {attribution.attributionUrl}
                            </a>
                          </p>
                        )}
                        {attribution.license && (
                          <p><strong>License:</strong> {attribution.license}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {metadata && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <p><strong>Latency:</strong> {metadata.latency}ms</p>
                        <p>
                          <strong>Cache:</strong>{' '}
                          <span className={metadata.cacheHit ? 'text-green-600' : 'text-orange-600'}>
                            {metadata.cacheHit ? 'HIT' : 'MISS'}
                          </span>
                        </p>
                        <p><strong>Content-Type:</strong> {metadata.contentType}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!imageUrl && !error && !loading && (
                <div className="text-center py-12 text-muted-foreground" data-testid="empty-state">
                  Configure parameters and click "Fetch Image" to test
                </div>
              )}

              {loading && (
                <div className="text-center py-12" data-testid="loading-state">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Fetching image...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
