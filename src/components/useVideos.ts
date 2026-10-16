import {useEffect, useState} from 'react';
import {loadVideos, savedVideos, type Video} from '../catalog/publications';

let pending: Promise<Video[]> | undefined;
export function useVideos() {
  const [videos, setVideos] = useState(savedVideos);
  useEffect(() => {
    let cancelled = false;
    void (pending ??= loadVideos()).then(items => {if (!cancelled) setVideos(items);});
    return () => {cancelled = true;};
  }, []);
  return videos;
}
