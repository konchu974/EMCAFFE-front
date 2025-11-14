/// <reference path="../.astro/types.d.ts" />
declare global {
  interface Window {
    dispatchAddToCartModal?: (product: any) => void;
    addToCart?: (product: any) => void;
    updateCartBadge?: () => void;
    clearCart?: () => void;
  }
}

export {};

