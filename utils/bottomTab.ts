export const FLOATING_TAB_BAR_HEIGHT = 82;
export const FLOATING_TAB_BAR_MIN_BOTTOM_PADDING = 10;
export const FLOATING_TAB_CONTENT_EXTRA_PADDING = 24;

export function getFloatingTabBarOverlayHeight(bottomInset: number) {
    return FLOATING_TAB_BAR_HEIGHT + Math.max(bottomInset, FLOATING_TAB_BAR_MIN_BOTTOM_PADDING);
}

export function getBottomTabContentPadding(
    bottomInset: number,
    extraPadding = FLOATING_TAB_CONTENT_EXTRA_PADDING,
) {
    return getFloatingTabBarOverlayHeight(bottomInset) + extraPadding;
}