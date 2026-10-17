"""Archive the channel's public feed. Existing entries survive the feed's rolling window."""
import json
import os
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

CHANNEL = 'UCFH81ruwAfy-d2TzVRjsJFA'
CATALOG = Path(__file__).resolve().parents[1] / 'public' / 'videos.json'
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015'}


def merge_feed(xml, saved):
    root = ET.fromstring(xml)
    if root.tag != '{' + NS['a'] + '}feed':
        raise ValueError('Expected an Atom feed')
    # YouTube sometimes omits the UC prefix in this field.
    if root.findtext('yt:channelId', namespaces=NS) not in (CHANNEL, CHANNEL[2:]):
        raise ValueError('Unexpected channel')
    videos = {video['id']: video for video in saved.get('videos', [])}
    for entry in root.findall('a:entry', NS):
        video_id = entry.findtext('yt:videoId', namespaces=NS)
        title = entry.findtext('a:title', namespaces=NS)
        published = entry.findtext('a:published', namespaces=NS)
        if not video_id or not re.fullmatch(r'[\w-]{11}', video_id) or not title or not published:
            raise ValueError('Incomplete feed entry')
        datetime.fromisoformat(published.replace('Z', '+00:00'))
        videos[video_id] = {'id': video_id, 'title': title, 'publishedAt': published}
    return {'channelId': CHANNEL, 'syncedOn': date.today().isoformat(),
            'videos': sorted(videos.values(), key=lambda video: datetime.fromisoformat(video['publishedAt'].replace('Z', '+00:00')), reverse=True)}


class FeedUnavailable(Exception):
    pass


def fetch_feed():
    request = urllib.request.Request(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL}', headers={'User-Agent': 'FrozenChocoGallery/1.0'})
    for attempt, delay in enumerate((0, 5, 15)):
        if delay:
            time.sleep(delay)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code not in (404, 408, 429, 500, 502, 503, 504):
                raise
            reason = f'HTTP {error.code}'
            error.close()
        except (urllib.error.URLError, TimeoutError) as error:
            reason = str(error)
        print(f'YouTube feed attempt {attempt + 1}/3 unavailable: {reason}')
    raise FeedUnavailable(reason)


def recent_archive(saved):
    # A successful empty feed is valid too; never confuse a failed request with an empty feed.
    if saved.get('channelId') != CHANNEL or not isinstance(saved.get('videos'), list):
        return False
    try:
        timestamp = datetime.fromisoformat(saved.get('syncedAt') or saved['syncedOn'])
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        return timedelta(0) <= datetime.now(timezone.utc) - timestamp < timedelta(hours=24)
    except (KeyError, TypeError, ValueError):
        return False


def main():
    saved = json.loads(CATALOG.read_text(encoding='utf-8'))
    try:
        xml = fetch_feed()
    except FeedUnavailable as error:
        if not recent_archive(saved):
            raise RuntimeError('YouTube feed unavailable; saved snapshot is missing or at least 24 hours old') from error
        message = 'YouTube feed temporarily unavailable after 3 attempts. Kept the existing archive; the next scheduled run will retry.'
        print(f'::warning::{message}')
        if os.environ.get('GITHUB_STEP_SUMMARY'):
            with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as summary:
                summary.write(f'YouTube sync deferred: {message}\n')
        return
    result = merge_feed(xml, saved)
    # Keep daily heartbeat commits; record the exact successful time when saving new content.
    if saved.get('syncedAt') and result == {key: value for key, value in saved.items() if key != 'syncedAt'}:
        print(f"Archived {len(result['videos'])} videos (unchanged)")
        return
    result['syncedAt'] = datetime.now(timezone.utc).isoformat()
    # Parse everything before replacing the snapshot; a failed request keeps the archive intact.
    temporary = CATALOG.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(CATALOG)
    print(f"Archived {len(result['videos'])} videos")


if __name__ == '__main__':
    main()
