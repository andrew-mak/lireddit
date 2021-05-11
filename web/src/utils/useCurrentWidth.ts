import { useState, useEffect } from 'react';

const isBrowser = () => typeof window !== "undefined"

const getWidth = () => {
  if (isBrowser()) {
    return window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth
  }
  else return null
}

const useCurrentWidth = () => {
  let [width, setWidth] = useState(getWidth());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const resizeListener = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // change width from the state object after 150 milliseconds
      if (width) timeoutId = setTimeout(() => setWidth(getWidth()), 150);
      else setWidth(getWidth());
    };

    if (isBrowser()) window.addEventListener('resize', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
    }
  }, [])

  return width;
}

export default useCurrentWidth;