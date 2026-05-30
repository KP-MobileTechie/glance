import type { ComponentType } from 'react';
import type { WidgetKind } from '@/lib/store/types';
import type { WidgetProps } from './ClockWidget';
import { ClockWidget } from './ClockWidget';
import { FocusWidget } from './FocusWidget';
import { BookmarksWidget } from './BookmarksWidget';
import { WeatherQuoteWidget } from './WeatherQuoteWidget';

export interface WidgetManifest {
  kind: WidgetKind;
  title: string;
  Component: ComponentType<WidgetProps>;
}

export const WIDGET_REGISTRY: Record<WidgetKind, WidgetManifest> = {
  clock: { kind: 'clock', title: 'Clock', Component: ClockWidget },
  focus: { kind: 'focus', title: 'Focus', Component: FocusWidget },
  bookmarks: { kind: 'bookmarks', title: 'Bookmarks', Component: BookmarksWidget },
  weatherQuote: { kind: 'weatherQuote', title: 'Weather and Quote', Component: WeatherQuoteWidget },
};
