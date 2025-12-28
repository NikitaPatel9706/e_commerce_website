// Utilities
const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`;

// Shared state: products and cart
const PRODUCTS = [
  {
    id: "scarf",
    name: "Chunky Warm Scarf",
    price: 1299,
    image:"images/scarf.jpg",
    description: "Soft wool scarf with plush texture.",
    featured: true,
  },
  {
    id: "bunny",
    name: " Bunny",
    price: 999,
    image: "images/bunny.jpg",
    description: "Hand-stitched bunny, perfect for gifting.",
    featured: true,
  },
  {
    id: "blanket",
    name: "Granny Square Blanket",
    price: 3499,
    image: "images/blanket.jpg",
    description: "Colorful, cozy throw with classic squares.",
    featured: true,
  },
  {
    id: "hanger",
    name: "Plant Hanger",
    price: 699,
    image: "images/hanger.jpg",
    description: "Minimal boho hanger for your plants.",
    featured: false,
  },
  {
    id: "tote",
    name: "Crochet Tote Bag",
    price: 1499,
    image: "images/tote_bags.jpg",
    description: "Everyday utility with handcrafted charm.",
    featured: false,
  },
  {
    id: "beanie",
    name: "Textured Beanie",
    price: 799,
    image: "images/benie.jpg",
    description: "Warm beanie with comfy fit.",
    featured: false,
  },
];

const CART_KEY = "crochet_cove_cart_v1";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

// Save + refresh cart UI
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// Cart operations
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((c) => c.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  saveCart();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((c) => c.id !== productId);
  saveCart();
}

function updateQty(productId, delta) {
  const item = cart.find((c) => c.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else saveCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function updateCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (el) el.textContent = cart.reduce((s, i) => s + i.qty, 0).toString();
}

// Cart drawer UI
function renderCart() {
  const itemsEl = document.querySelector("[data-cart-items]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!itemsEl || !totalEl) return;

  itemsEl.innerHTML = "";
  cart.forEach((item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (!product) return;
    const wrapper = document.createElement("div");
    wrapper.className = "cart-item";
    wrapper.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <h4>${product.name}</h4>
        <div class="price">${formatCurrency(product.price)} each</div>
        <div class="cart-qty">
          <button aria-label="Decrease" data-qty-dec="${product.id}">−</button>
          <span>${item.qty}</span>
          <button aria-label="Increase" data-qty-inc="${product.id}">+</button>
        </div>
        <button class="btn btn-small" data-remove="${product.id}">Remove</button>
      </div>
      <div><strong>${formatCurrency(product.price * item.qty)}</strong></div>
    `;
    itemsEl.appendChild(wrapper);
  });

  totalEl.textContent = formatCurrency(cartTotal());

  // Bind item controls
  itemsEl.querySelectorAll("[data-qty-inc]").forEach((btn) =>
    btn.addEventListener("click", (e) => updateQty(e.target.getAttribute("data-qty-inc"), +1))
  );
  itemsEl.querySelectorAll("[data-qty-dec]").forEach((btn) =>
    btn.addEventListener("click", (e) => updateQty(e.target.getAttribute("data-qty-dec"), -1))
  );
  itemsEl.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", (e) => removeFromCart(e.target.getAttribute("data-remove")))
  );
}

function openCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (!drawer || !backdrop) return;
  drawer.classList.add("open");
  backdrop.classList.add("show");
}
function closeCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("open");
  backdrop.classList.remove("show");
}

// Shop page rendering
function renderProducts(sort = "featured") {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  let list = [...PRODUCTS];
  switch (sort) {
    case "priceAsc": list.sort((a, b) => a.price - b.price); break;
    case "priceDesc": list.sort((a, b) => b.price - a.price); break;
    case "nameAsc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "nameDesc": list.sort((a, b) => b.name.localeCompare(a.name)); break;
    default:
      list.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
  }

  grid.innerHTML = "";
  list.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.id = p.id;
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="card-actions" style="display:flex; align-items:center; justify-content:space-between;">
          <strong>${formatCurrency(p.price)}</strong>
          <button class="btn btn-small" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-add]").forEach((btn) =>
    btn.addEventListener("click", (e) => addToCart(e.target.getAttribute("data-add")))
  );
}

// Contact form validation
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const success = document.getElementById("formSuccess");
  const showError = (name, msg) => {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const consent = form.querySelector("#consent").checked;

    showError("name", "");
    showError("email", "");
    showError("message", "");
    showError("consent", "");

    if (name.length < 2) { showError("name", "Please enter your full name."); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("email", "Enter a valid email address."); valid = false; }
    if (message.length < 10) { showError("message", "Message should be at least 10 characters."); valid = false; }
    if (!consent) { showError("consent", "We need your consent to contact you."); valid = false; }

    if (!valid) return;

    // Demo: pretend to submit and show success
    success.hidden = false;
    form.reset();
  });
}

// Navigation & global init
function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
}

function initCartUI() {
  const openBtn = document.querySelector("[data-cart-open]");
  const closeBtn = document.querySelector("[data-cart-close]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (openBtn) openBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (backdrop) backdrop.addEventListener("click", closeCart);

  const checkoutBtn = document.querySelector("[data-checkout]");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) return alert("Your cart is empty.");
      alert("Checkout is a demo here. Integrate Razorpay/Stripe for payments.");
    });
  }
}

function initSort() {
  const select = document.getElementById("sortSelect");
  if (!select) return;
  select.addEventListener("change", (e) => {
    renderProducts(e.target.value);
  });
}

function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initNav();
  initCartUI();
  updateCartCount();
  renderCart();
  renderProducts(); // on shop page, will no-op if grid not found
  initSort();
  initContactForm();
});