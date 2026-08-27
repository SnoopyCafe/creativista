<?php
/**
 * Referrer collector for static sites on shared hosting.
 *
 * Records where each visit came from, which the server's own access log
 * does not capture. One row per visit (not per page view).
 *
 * Install: upload this file to  public_html/ref/collect.php
 * The CSV is written to  public_html/ref/data/referrers.csv  and is blocked
 * from web access by the .htaccess file that ships alongside it.
 */

declare(strict_types=1);

// ---------------------------------------------------------------- settings
$ALLOWED_HOSTS = [
    'creativistapods.com',
    'www.creativistapods.com',
];

$DATA_DIR  = __DIR__ . '/data';
$CSV_PATH  = $DATA_DIR . '/referrers.csv';
$MAX_BYTES = 8 * 1024 * 1024;   // stop writing past 8 MB; rotate instead
$MAX_FIELD = 300;               // truncate any single field to this length

// ---------------------------------------------------------------- responses
function finish(int $code): never
{
    http_response_code($code);
    header('Content-Length: 0');
    exit;
}

// Only POST is accepted. A GET from a crawler must not create a row.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    finish(405);
}

// The request must originate from one of our own pages. Origin is set by the
// browser on fetch()/sendBeacon() and cannot be forged by page JavaScript.
$origin     = $_SERVER['HTTP_ORIGIN'] ?? '';
$originHost = $origin !== '' ? (parse_url($origin, PHP_URL_HOST) ?: '') : '';

if ($originHost === '' || !in_array(strtolower($originHost), $ALLOWED_HOSTS, true)) {
    finish(403);
}

// ---------------------------------------------------------------- input
$raw = file_get_contents('php://input', false, null, 0, 4096);
if ($raw === false || $raw === '') {
    finish(400);
}

$in = json_decode($raw, true);
if (!is_array($in)) {
    finish(400);
}

/** Trim to a single safe line: no CR/LF, no control characters, length capped. */
function clean(mixed $v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    $v = trim($v);
    if ($v === '') {
        return '';
    }
    // mb_substr keeps multibyte characters intact when truncating.
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}

$referrer = clean($in['referrer'] ?? '', $MAX_FIELD);
$landing  = clean($in['landing']  ?? '', $MAX_FIELD);
$utmSrc   = clean($in['utm_source'] ?? '', 80);
$utmMed   = clean($in['utm_medium'] ?? '', 80);
$utmCamp  = clean($in['utm_campaign'] ?? '', 80);
$screen   = clean($in['screen'] ?? '', 20);

// ---------------------------------------------------------------- classify
$refHost = $referrer !== '' ? strtolower(parse_url($referrer, PHP_URL_HOST) ?: '') : '';

/** Map a referring hostname (and any click-id / utm hints) to a plain source name. */
function classify(string $refHost, string $landing, string $utmSrc): string
{
    // Click IDs on the landing URL are the strongest signal — they survive
    // even when the referring page sends no Referer header.
    $q = strtolower($landing);
    if (str_contains($q, 'fbclid='))  return 'Facebook';
    if (str_contains($q, 'igshid='))  return 'Instagram';
    if (str_contains($q, 'gclid=') || str_contains($q, 'gbraid=')) return 'Google Ads';
    if (str_contains($q, 'msclkid=')) return 'Microsoft Ads';
    if (str_contains($q, 'ttclid='))  return 'TikTok';

    if ($utmSrc !== '') {
        $u = strtolower($utmSrc);
        foreach ([
            'facebook' => 'Facebook', 'fb' => 'Facebook', 'ig' => 'Instagram',
            'instagram' => 'Instagram', 'google' => 'Google', 'bing' => 'Bing',
            'chatgpt' => 'ChatGPT', 'newsletter' => 'Email', 'email' => 'Email',
        ] as $needle => $name) {
            if (str_contains($u, $needle)) return $name;
        }
        return 'Tagged: ' . $utmSrc;
    }

    if ($refHost === '') return 'Direct / none';

    $map = [
        'facebook.'  => 'Facebook',   'fb.com'      => 'Facebook',
        'instagram.' => 'Instagram',  'l.instagram' => 'Instagram',
        'google.'    => 'Google',     'googleusercontent' => 'Google',
        'bing.'      => 'Bing',       'duckduckgo.' => 'DuckDuckGo',
        'yahoo.'     => 'Yahoo',      'ecosia.'     => 'Ecosia',
        'pinterest.' => 'Pinterest',  'linkedin.'   => 'LinkedIn',
        'lnkd.in'    => 'LinkedIn',   't.co'        => 'X / Twitter',
        'x.com'      => 'X / Twitter','twitter.'    => 'X / Twitter',
        'tiktok.'    => 'TikTok',     'reddit.'     => 'Reddit',
        'youtube.'   => 'YouTube',    'youtu.be'    => 'YouTube',
        'chatgpt.'   => 'ChatGPT',    'openai.'     => 'ChatGPT',
        'perplexity.'=> 'Perplexity', 'claude.ai'   => 'Claude',
        'nextdoor.'  => 'Nextdoor',   'yelp.'       => 'Yelp',
        'eventbrite.'=> 'Eventbrite',
    ];
    foreach ($map as $needle => $name) {
        if (str_contains($refHost, $needle)) return $name;
    }
    return 'Other: ' . $refHost;
}

$source = classify($refHost, $landing, $utmSrc);

// A referral from our own domain is internal navigation, not a new visit.
if ($refHost !== '' && in_array($refHost, $ALLOWED_HOSTS, true)) {
    finish(204);
}

// ---------------------------------------------------------------- write
if (!is_dir($DATA_DIR) && !mkdir($DATA_DIR, 0755, true) && !is_dir($DATA_DIR)) {
    finish(500);
}

// Size guard: stop appending rather than filling the hosting quota.
if (is_file($CSV_PATH) && filesize($CSV_PATH) > $MAX_BYTES) {
    finish(507);
}

$isNew = !is_file($CSV_PATH);
$fh = fopen($CSV_PATH, 'ab');
if ($fh === false) {
    finish(500);
}

if (flock($fh, LOCK_EX)) {
    if ($isNew) {
        fputcsv($fh, ['timestamp_utc', 'site', 'source', 'referrer', 'landing_path',
                      'utm_source', 'utm_medium', 'utm_campaign', 'screen'], ',', '"', '\\');
    }
    fputcsv($fh, [
        gmdate('c'),
        strtolower($originHost),
        $source,
        $referrer,
        $landing,
        $utmSrc,
        $utmMed,
        $utmCamp,
        $screen,
    ], ',', '"', '\\');
    fflush($fh);
    flock($fh, LOCK_UN);
}
fclose($fh);

finish(204);
