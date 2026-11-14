import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Every route's interior is code-split (brief section 13).
const Landing = lazy(() => import('./routes/Landing'));
const SectionStub = lazy(() => import('./routes/SectionStub'));
const Playground = lazy(() => import('./routes/Playground'));
const NotFound = lazy(() => import('./routes/NotFound'));

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Suspense fallback={<div className="route-fallback" aria-hidden="true" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/work" element={<SectionStub id="work" />} />
          <Route path="/work/:slug" element={<SectionStub id="work" />} />
          <Route path="/about" element={<SectionStub id="about" />} />
          <Route path="/writing" element={<SectionStub id="writing" />} />
          <Route path="/writing/:slug" element={<SectionStub id="writing" />} />
          <Route path="/gallery" element={<SectionStub id="gallery" />} />
          <Route path="/contact" element={<SectionStub id="contact" />} />
          <Route path="/resume" element={<SectionStub id="resume" />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
