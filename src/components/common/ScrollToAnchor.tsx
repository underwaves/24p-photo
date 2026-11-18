import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToAnchor: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        const timer = setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  return null;
};
