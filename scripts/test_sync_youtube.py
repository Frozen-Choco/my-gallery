import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('sync', Path(__file__).with_name('sync-youtube.py'))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


def feed(entries='', channel=sync.CHANNEL):
    return f'<feed xmlns="{sync.NS["a"]}" xmlns:yt="{sync.NS["yt"]}"><yt:channelId>{channel}</yt:channelId>{entries}</feed>'


def entry(id, title, date):
    return f'<entry><yt:videoId>{id}</yt:videoId><title>{title}</title><published>{date}</published></entry>'


class ArchiveTest(unittest.TestCase):
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
