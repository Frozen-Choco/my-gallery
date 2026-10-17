import {useCallback, useEffect, useRef, useState} from 'react';

export const bannerIndex = (position: number) => ((Math.round(position) % 5) + 5) % 5;

// A closed curve through the five resting positions, including the path behind the cards.
const poses = [[0, 0, 1], [31, -38, .68], [56, -72, .42], [-56, -72, .42], [-31, -38, .68]];
export function bannerPose(slot: number) {
  const phase = ((slot % 5) + 5) % 5;
  const index = Math.floor(phase);
  const t = phase - index;
  return [0, 1, 2].map(axis => {
    const [a, b, c, d] = [-1, 0, 1, 2].map(offset => poses[(index + offset + 5) % 5][axis]);
    return .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  });
}

export function useBannerRotation(reduced: boolean) {
  const [position, setPosition] = useState(0);
  const motion = useRef({position:0, target:0, frame:0, lastTime:0, followTime:150});
  const wheelEnd = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
      state.position += (state.target - state.position) * (1 - Math.exp(-elapsed / state.followTime));
      const settled = Math.abs(state.target - state.position) < .001;
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
    motion.current.followTime = 150;
    animate();
  }, [animate]);

  const selectCard = useCallback((index: number) => {
    clearTimeout(wheelEnd.current);
    wheelEnd.current = undefined;
    const state = motion.current;
    const distance = (((index - state.position + 2.5) % 5) + 5) % 5 - 2.5;
    state.target = state.position + distance;
    state.followTime = 120;
    animate();
  }, [animate]);

  const scrollBy = useCallback((pixels: number) => {
    const state = motion.current;
    // Every input contributes a fractional turn, without a per-card cooldown.
    if (wheelEnd.current === undefined) state.target = state.position;
    state.target += pixels / 180;
    state.followTime = 65;
    animate();
    clearTimeout(wheelEnd.current);
    wheelEnd.current = setTimeout(() => {
      wheelEnd.current = undefined;
      state.target = Math.round(state.target);
      state.followTime = 90;
      animate();
    }, 180);
  }, [animate]);

  useEffect(() => {
    if (reduced) {
      const state = motion.current;
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

  return {position, rotateBy, selectCard, scrollBy};
}
