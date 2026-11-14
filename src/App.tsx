import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CharacterProvider } from './characters/CharacterProvider';
import { DiveProvider } from './dive/DiveProvider';
import { AnnouncerProvider } from './components/Announcer';

// Every route's interior is code-split (brief section 13).
const Landing = lazy(() => import('./routes/Landing'));
const SectionRoute = lazy(() => import('./routes/SectionRoute'));
const Playground = lazy(() => import('./routes/Playground'));
const NotFound = lazy(() => import('./routes/NotFound'));

export default function App() {
  return (
    <CharacterProvider>
      <AnnouncerProvider>
        <DiveProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Suspense fallback={<main id="main" className="route-fallback" />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              {/* dev-only: every character × every mood */}
              {import.meta.env.DEV && <Route path="/playground" element={<Playground />} />}
              {/* every section, with or without a slug: /work, /work/bharosa, /about … */}
              <Route path="/:section/:slug?" element={<SectionRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </DiveProvider>
      </AnnouncerProvider>
    </CharacterProvider>
  );
}
