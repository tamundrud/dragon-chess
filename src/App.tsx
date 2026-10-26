/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { lazy, Suspense } from 'react';
const FirewormPreview = lazy(() => import('./game/preview/FirewormPreview'));
import { GameShell } from './game/GameShell';

export default function App() {
  if (new URLSearchParams(window.location.search).get('preview') === 'fireworm') {
    return <Suspense fallback={<p>Loading Fireworm…</p>}><FirewormPreview /></Suspense>;
  }
  return <GameShell />;
}
