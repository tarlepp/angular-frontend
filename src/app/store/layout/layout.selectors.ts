import { createFeatureSelector, createSelector } from '@ngrx/store';

import { LayoutState } from 'src/app/store/store-states';
import { Device, Viewport } from 'src/app/shared/enums';

const layoutState = createFeatureSelector<LayoutState>('layout');
const language = createSelector(layoutState, (state: LayoutState): string => state.language);
const locale = createSelector(layoutState, (state: LayoutState): string => state.locale);
const timezone = createSelector(layoutState, (state: LayoutState): string => state.timezone);
const viewport = createSelector(layoutState, (state: LayoutState): Viewport => state.viewport);
const device = createSelector(layoutState, (state: LayoutState): Device => state.device);
const isMobile = createSelector(layoutState, (state: LayoutState): boolean => state.mobile);
const isTablet = createSelector(layoutState, (state: LayoutState): boolean => state.tablet);
const isDesktop = createSelector(layoutState, (state: LayoutState): boolean => state.desktop);

export const layoutSelectors = {
  language,
  locale,
  timezone,
  viewport,
  device,
  isMobile,
  isTablet,
  isDesktop,
};
