import type { ComponentType } from 'react';
import type { WidgetKind } from '@/lib/store/types';
import type { WidgetProps } from './ClockWidget';
import { ClockWidget } from './ClockWidget';
import { FocusWidget } from './FocusWidget';
import { BookmarksWidget } from './BookmarksWidget';
import { WeatherQuoteWidget } from './WeatherQuoteWidget';
import { PomodoroWidget } from './PomodoroWidget';
import { NewsWidget } from './NewsWidget';
import { GitHubWidget } from './GitHubWidget';
import { DevToolsWidget } from './DevToolsWidget';

export interface WidgetManifest {
  kind: WidgetKind;
  title: string;
  Component: ComponentType<WidgetProps>;
}

export const WIDGET_REGISTRY: Record<WidgetKind, WidgetManifest> = {
  clock:        { kind: 'clock',        title: 'Clock',             Component: ClockWidget },
  focus:        { kind: 'focus',        title: 'Focus',             Component: FocusWidget },
  bookmarks:    { kind: 'bookmarks',    title: 'Bookmarks',         Component: BookmarksWidget },
  weatherQuote: { kind: 'weatherQuote', title: 'Weather and Quote', Component: WeatherQuoteWidget },
  pomodoro:     { kind: 'pomodoro',     title: 'Pomodoro Timer',    Component: PomodoroWidget },
  news:         { kind: 'news',         title: 'Hacker News / RSS', Component: NewsWidget },
  github:       { kind: 'github',       title: 'GitHub Activity',   Component: GitHubWidget },
  devTools:     { kind: 'devTools',     title: 'Dev Tools',         Component: DevToolsWidget },
};
