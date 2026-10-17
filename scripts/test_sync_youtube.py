import importlib.util
from io import BytesIO
import unittest
import json
import tempfile
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError
from pathlib import Path

spec = importlib.util.spec_from_file_location('sync', Path(__file__).with_name('sync-youtube.py'))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


def feed(entries='', channel=sync.CHANNEL):
    return f'<feed xmlns="{sync.NS["a"]}" xmlns:yt="{sync.NS["yt"]}"><yt:channelId>{channel}</yt:channelId>{entries}</feed>'


def entry(id, title, date):
    return f'<entry><yt:videoId>{id}</yt:videoId><title>{title}</title><published>{date}</published></entry>'


class ArchiveTest(unittest.TestCase):
    def test_success_adds_snapshot_timestamp_without_hourly_commits(self):
        with tempfile.TemporaryDirectory() as directory:
            catalog = Path(directory) / 'videos.json'
            saved = sync.merge_feed(feed(), {'videos': []})
            catalog.write_text(json.dumps(saved))
            with patch.object(sync, 'CATALOG', catalog), patch.object(sync, 'fetch_feed', return_value=feed()):
                sync.main()
                result = json.loads(catalog.read_text())
                self.assertTrue(sync.recent_archive(result))
                self.assertIn('syncedAt', result)
                original = catalog.read_bytes()
                sync.main()
                self.assertEqual(catalog.read_bytes(), original)

    def test_retries_temporary_404_then_recovers(self):
        response = MagicMock()
        response.__enter__.return_value.read.return_value = feed().encode()
        with patch.object(sync.urllib.request, 'urlopen', side_effect=[HTTPError('url', 404, 'Not Found', {}, BytesIO()), response]) as request, patch.object(sync.time, 'sleep') as sleep:
            self.assertEqual(sync.fetch_feed(), feed().encode())
            self.assertEqual(request.call_count, 2)
            sleep.assert_called_once_with(5)

    def test_temporary_failure_preserves_recent_archive_but_stale_archive_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            catalog = Path(directory) / 'videos.json'
            saved = {'channelId':sync.CHANNEL, 'videos':[], 'syncedAt':datetime.now(timezone.utc).isoformat()}
            catalog.write_text(json.dumps(saved))
            original = catalog.read_bytes()
            with patch.object(sync, 'CATALOG', catalog), patch.object(sync, 'fetch_feed', side_effect=sync.FeedUnavailable('HTTP 404')):
                sync.main()
                self.assertEqual(catalog.read_bytes(), original)
                saved['syncedAt'] = (datetime.now(timezone.utc) - timedelta(hours=25)).isoformat()
                catalog.write_text(json.dumps(saved))
                with self.assertRaises(RuntimeError):
                    sync.main()
                self.assertEqual(json.loads(catalog.read_text()), saved)

    def test_retry_exhaustion_and_permanent_error(self):
        with patch.object(sync.urllib.request, 'urlopen', side_effect=HTTPError('url', 404, 'Not Found', {}, BytesIO())) as request, patch.object(sync.time, 'sleep'):
            with self.assertRaises(sync.FeedUnavailable):
                sync.fetch_feed()
            self.assertEqual(request.call_count, 3)
        with patch.object(sync.urllib.request, 'urlopen', side_effect=HTTPError('url', 403, 'Forbidden', {}, BytesIO())) as request:
            with self.assertRaises(HTTPError):
                sync.fetch_feed()
            self.assertEqual(request.call_count, 1)

    def test_retains_older_posts_updates_titles_and_sorts_by_original_publication(self):
        saved = {'videos': [{'id':'older_video', 'title':'Old', 'publishedAt':'2025-01-01T00:00:00Z'}, {'id':'newer_video', 'title':'Before', 'publishedAt':'2026-01-01T00:00:00Z'}]}
        result = sync.merge_feed(feed(entry('newer_video', 'After &amp; title', '2026-01-01T00:00:00Z') + entry('latestvideo', 'Latest', '2026-10-16T00:00:00Z')), saved)
        self.assertEqual([v['id'] for v in result['videos']], ['latestvideo','newer_video','older_video'])
        self.assertEqual(result['videos'][1]['title'], 'After & title')

    def test_empty_feed_and_short_channel_id(self):
        self.assertEqual(sync.merge_feed(feed(channel=sync.CHANNEL[2:]), {'videos':[]})['videos'], [])

    def test_invalid_response_does_not_silently_replace_archive(self):
        for xml in ['<html/>', feed(channel='another-channel'), feed(entry('bad', 'Title', 'invalid'))]:
            with self.assertRaises(ValueError):
                sync.merge_feed(xml, {'videos':[]})


if __name__ == '__main__':
    unittest.main()
