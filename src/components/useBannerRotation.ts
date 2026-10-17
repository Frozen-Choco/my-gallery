import {useCallback, useEffect, useRef, useState} from 'react';

export const bannerIndex = (position: number) => ((Math.round(position) % 5) + 5) % 5;

const FOLLOW_TIME = 150;
// A closed curve through the five resting positions, including the path behind the cards.
const poses = [[0, 0, 1], [31, -38, .68], [56, -72, .42], [-56, -72, .42], [-31, -38, .68]];
export function bannerPose(slot: number) {
  const phase = ((slot % 5) + 5) % 5;
  const index = Math.floor(phase);
  const t = phase - index;
  return [0, 1, 2].map(axis => {
    const [a, b, c, d] = [-1, 0, 1, 2].map(offset => poses[(index + offset + 5) % 5][axis]);
    // Turn inward at the outer cards rather than overshooting the preview edges.
    const tangent = (at: number, value: number) => axis === 0 && (at === 2 || at === 3) ? 0 : value;
    const start = tangent(index, (c - a) / 2);
    const end = tangent((index + 1) % 5, (d - b) / 2);
    return (2 * t ** 3 - 3 * t ** 2 + 1) * b + (t ** 3 - 2 * t ** 2 + t) * start
      + (-2 * t ** 3 + 3 * t ** 2) * c + (t ** 3 - t ** 2) * end;
  });
}

export function useBannerRotation(reduced: boolean) {
  const [position, setPosition] = useState(0);
  const motion = useRef({position:0, target:0, frame:0, lastTime:0, velocity:0});
  const wheelEnd = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragOrigin = useRef(0);
  const dragSamples = useRef<{position: number; time: number}[]>([]);

  const animate = useCallback(() => {
    const state = motion.current;
    if (reduced) {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.position = state.target;
      setPosition(state.position);
      return;
    }
    if (state.frame) return;
    state.lastTime = performance.now();
    const frame = (time: number) => {
      const elapsed = Math.min(64, Math.max(0, time - state.lastTime));
      state.lastTime = time;
      if (state.velocity) {
        const decay = Math.exp(-elapsed / 180);
        state.position += state.velocity * 180 * (1 - decay);
        state.velocity *= decay;
        state.target = state.position;
        if (Math.abs(state.velocity) < .0003) {
          state.velocity = 0;
          state.target = Math.round(state.position);
        }
      } else {
        state.position += (state.target - state.position) * (1 - Math.exp(-elapsed / FOLLOW_TIME));
      }
      const settled = !state.velocity && Math.abs(state.target - state.position) < .001;
      if (settled) state.position = state.target;
      setPosition(state.position);
      state.frame = settled ? 0 : requestAnimationFrame(frame);
    };
    state.frame = requestAnimationFrame(frame);
  }, [reduced]);

  const rotateBy = useCallback((amount: number) => {
    clearTimeout(wheelEnd.current);
    wheelEnd.current = undefined;
    motion.current.target = Math.round(motion.current.target) + amount;
    motion.current.velocity = 0;
    animate();
  }, [animate]);

  const selectCard = useCallback((index: number) => {
    clearTimeout(wheelEnd.current);
    wheelEnd.current = undefined;
    const state = motion.current;
    state.velocity = 0;
    const distance = (((index - state.position + 2.5) % 5) + 5) % 5 - 2.5;
    state.target = state.position + distance;
    animate();
  }, [animate]);

  const scrollBy = useCallback((pixels: number) => {
    const state = motion.current;
    state.velocity = 0;
    // Every input contributes a fractional turn, without a per-card cooldown.
    if (wheelEnd.current === undefined) state.target = state.position;
    state.target += pixels / 180;
    animate();
    clearTimeout(wheelEnd.current);
    wheelEnd.current = setTimeout(() => {
      wheelEnd.current = undefined;
      state.target = Math.round(state.target);
      animate();
    }, 180);
  }, [animate]);

  const beginDrag = useCallback(() => {
    clearTimeout(wheelEnd.current);
    wheelEnd.current = undefined;
    const state = motion.current;
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.velocity = 0;
    state.target = state.position;
    dragOrigin.current = state.position;
    dragSamples.current = [{position:state.position, time:performance.now()}];
  }, []);

  const dragTo = useCallback((offset: number) => {
    const state = motion.current;
    // Finger movement is direct; smoothing is reserved for the release.
    state.position = state.target = dragOrigin.current + offset;
    const samples = dragSamples.current;
    const last = samples[samples.length - 1];
    if (last && last.position !== state.position) {
      const now = performance.now();
      // Ignore duplicate release coordinates and use only the recent movement direction.
      const previous = samples[samples.length - 2];
      if (previous && (last.position - previous.position) * (state.position - last.position) < 0) samples.splice(0, samples.length - 1);
      if (last.time === now) samples.pop();
      samples.push({position:state.position, time:now});
      while (samples.length > 2 && samples[1].time < now - 100) samples.shift();
    }
    setPosition(state.position);
  }, []);

  const endDrag = useCallback((withMomentum = false) => {
    const state = motion.current;
    const samples = dragSamples.current;
    const first = samples[0];
    const last = samples[samples.length - 1];
    state.velocity = 0;
    if (withMomentum && !reduced && first && last && last.time > first.time && performance.now() - last.time < 100) {
      // At most about one extra card, even after a very fast flick.
      const velocity = (last.position - first.position) / (last.time - first.time);
      if (Math.abs(velocity) >= .0006) state.velocity = Math.max(-.005, Math.min(.005, velocity));
    }
    state.target = Math.round(state.position);
    animate();
  }, [animate, reduced]);

  useEffect(() => {
    if (reduced) {
      const state = motion.current;
      state.velocity = 0;
      state.position = state.target = Math.round(state.target);
      setPosition(state.position);
    }
    return () => {
      cancelAnimationFrame(motion.current.frame);
      motion.current.frame = 0;
      clearTimeout(wheelEnd.current);
      wheelEnd.current = undefined;
    };
  }, [reduced]);

  return {position, rotateBy, selectCard, scrollBy, beginDrag, dragTo, endDrag};
}
