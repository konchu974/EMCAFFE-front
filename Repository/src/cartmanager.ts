interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    format: string;
    quantity: number;
}

function getCart(): CartItem[] {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart: CartItem[]) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item: CartItem) {
    let cart = getCart();

    const existing = cart.find(
        (p) => p.id === item.id && p.format === item.format
    );

    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.push(item);
    }

    saveCart(cart);
    updateCartBadge();
}

export function updateCartBadge() {
    // 🔹 Update both mobile and desktop cart badges
    const badges = [
        document.getElementById("cart-count"),
        document.getElementById("cart-count-desktop")
    ];

    const cart = getCart();
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

    badges.forEach((badge) => {
        if (!badge) return;
        if (totalItems > 0) {
            badge.textContent = totalItems.toString();
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    });
}

export function clearCart() {
    localStorage.removeItem("cart");
    updateCartBadge();
}

// Expose globally
(window as any).addToCart = addToCart;
(window as any).updateCartBadge = updateCartBadge;
(window as any).clearCart = clearCart;
