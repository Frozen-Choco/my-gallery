"""Archive the channel's public feed. Existing entries survive the feed's rolling window."""
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, datetime
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


def main():
    request = urllib.request.Request(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL}', headers={'User-Agent': 'FrozenChocoGallery/1.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        xml = response.read()
    saved = json.loads(CATALOG.read_text(encoding='utf-8'))
    result = merge_feed(xml, saved)
    # Parse everything before replacing the snapshot; a failed request keeps the archive intact.
    temporary = CATALOG.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(CATALOG)
    print(f"Archived {len(result['videos'])} videos")


if __name__ == '__main__':
    main()
