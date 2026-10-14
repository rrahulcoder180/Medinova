
let medicines = [];
let cart = [];
let toastTimer;

const medicineGrid = document.getElementById("medicine-grid");
const medicineStatus = document.getElementById("medicine-status");
console.log("Medinova HTML check:", {
  page: window.location.href,
  medicineGridFound: Boolean(medicineGrid),
  medicineStatusFound: Boolean(medicineStatus),
  scriptURL: document.currentScript?.src
});

const fallbackImages = {
  medicine:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  vitamin:
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
  firstaid:
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
  health:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
};

// Safely display text received from the backend.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getMedicineName(medicine) {
  return String(
    medicine.name ||
    medicine.medicineName ||
    medicine.title ||
    "Healthcare product"
  );
}

function getMedicinePrice(medicine) {
  const price = Number(medicine.price ?? medicine.unitPrice ?? 0);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function getMedicineId(medicine) {
  return medicine.id ?? medicine.medicineId ?? getMedicineName(medicine);
}

function getCategory(medicine) {
  return String(medicine.category || "Health");
}

function getDescription(medicine) {
  return String(
    medicine.description ||
    medicine.details ||
    "Healthcare essential for everyday needs."
  );
}

function getImage(medicine) {
  const text = (
    getMedicineName(medicine) + " " + getCategory(medicine)
  ).toLowerCase();

  if (/vitamin|supplement|nutrition/.test(text)) {
    return fallbackImages.vitamin;
  }

  if (/first.?aid|bandage|antiseptic|dressing/.test(text)) {
    return fallbackImages.firstaid;
  }

  if (/health|care|medical/.test(text)) {
    return fallbackImages.health;
  }

  return fallbackImages.medicine;
}

// Normalize category names for filtering.
function normalizeCategory(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// LOAD MEDICINES FROM SPRING BOOT
async function loadMedicines() {
  if (!medicineGrid || !medicineStatus) {
    console.error(
      "Missing medicine-grid or medicine-status in index.html."
    );
    return;
  }

  medicineStatus.textContent = "Loading medicines...";

  try {
    const response = await fetch("/api/medicines");

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The medicines API did not return a list.");
    }

    medicines = data;
    filterMedicines();
  } catch (error) {
    console.error("Medicine loading error:", error);
    medicineStatus.textContent =
      "Could not load medicines. Make sure Spring Boot is running.";
    medicineGrid.innerHTML = "";
  }
}

// DISPLAY MEDICINE CARDS
function renderMedicines(list) {
  if (!medicineGrid || !medicineStatus) return;

  medicineGrid.innerHTML = "";

  if (!list.length) {
    medicineStatus.textContent =
      "No medicines found. Try another search or category.";
    return;
  }

  medicineStatus.textContent = "";

  list.forEach(medicine => {
    const card = document.createElement("article");
    card.className = "medicine-card";

    const name = getMedicineName(medicine);
    const category = getCategory(medicine);
    const price = getMedicinePrice(medicine);
    const description = getDescription(medicine);

    card.innerHTML = `
      <img
        class="medicine-image"
        src="${escapeHTML(getImage(medicine))}"
        alt="${escapeHTML(name)}"
        loading="lazy"
      >

      <div class="medicine-info">
        <span class="medicine-category">
          ${escapeHTML(category)}
        </span>

        <h3>${escapeHTML(name)}</h3>

        <p class="medicine-description">
          ${escapeHTML(description)}
        </p>

        <div class="medicine-bottom">
          <span class="medicine-price">
            ₹${price.toFixed(2)}
          </span>

          <button class="add-button" type="button">
            + Add
          </button>
        </div>
      </div>
    `;

    const image = card.querySelector(".medicine-image");

    image.addEventListener("error", () => {
      image.onerror = null;
      image.src = fallbackImages.medicine;
    });

    card.querySelector(".add-button").addEventListener("click", () => {
      addToCart(medicine);
    });

    medicineGrid.appendChild(card);
  });
}

// SEARCH AND CATEGORY FILTER
function filterMedicines() {
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");

  if (!searchInput || !categoryFilter) {
    console.error("Search or category filter is missing.");
    return;
  }

  const search = searchInput.value.trim().toLowerCase();
  const selectedCategory = normalizeCategory(categoryFilter.value);

  const filtered = medicines.filter(medicine => {
    const name = getMedicineName(medicine).toLowerCase();
    const description = getDescription(medicine).toLowerCase();
    const category = getCategory(medicine).toLowerCase();

    const searchableText = `${name} ${description} ${category}`;

    const matchesSearch = searchableText.includes(search);

    const normalizedProductCategory = normalizeCategory(category);

    let matchesCategory = selectedCategory === "all";

    if (!matchesCategory) {
      switch (selectedCategory) {
        case "painrelief":
          matchesCategory =
            /pain|analgesic|paracetamol|ibuprofen/.test(
              normalizedProductCategory + normalizeCategory(name)
            );
          break;

        case "vitamin":
        case "vitamins":
          matchesCategory =
            /vitamin|supplement|nutrition/.test(
              normalizedProductCategory + normalizeCategory(name)
            );
          break;

        case "firstaid":
          matchesCategory =
            /firstaid|bandage|antiseptic|dressing|wound/.test(
              normalizedProductCategory + normalizeCategory(name)
            );
          break;

        case "health":
          matchesCategory =
            /health|care|medical/.test(normalizedProductCategory);
          break;

        default:
          matchesCategory =
            normalizedProductCategory.includes(selectedCategory);
      }
    }

    return matchesSearch && matchesCategory;
  });

  renderMedicines(filtered);
}

// ADD PRODUCT TO CART
function addToCart(medicine) {
  const id = String(getMedicineId(medicine));

  const existing = cart.find(
    item => String(getMedicineId(item.medicine)) === id
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      medicine,
      quantity: 1
    });
  }

  renderCart();
  showToast(getMedicineName(medicine) + " added to cart.");
}

// CHANGE CART QUANTITY
function changeQuantity(id, change) {
  const item = cart.find(
    entry => String(getMedicineId(entry.medicine)) === String(id)
  );

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry !== item);
  }

  renderCart();
}

// CALCULATE TOTAL
function getCartTotal() {
  return cart.reduce(
    (sum, item) =>
      sum + getMedicinePrice(item.medicine) * item.quantity,
    0
  );
}

// RENDER CART
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartCount || !cartTotal) {
    console.error("One or more cart elements are missing.");
    return;
  }

  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  cartCount.textContent = count;
  cartTotal.textContent = "₹" + getCartTotal().toFixed(2);

  if (!cart.length) {
    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty. Add a healthcare product to get started.
      </p>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const id = escapeHTML(getMedicineId(item.medicine));
    const name = escapeHTML(getMedicineName(item.medicine));
    const price = getMedicinePrice(item.medicine);

    return `
      <div class="cart-item">
        <div>
          <h4>${name}</h4>
          <p>₹${price.toFixed(2)} each</p>

          <div class="quantity-controls">
            <button
              type="button"
              data-id="${id}"
              data-change="-1"
              aria-label="Decrease quantity">−</button>

            <span>${item.quantity}</span>

            <button
              type="button"
              data-id="${id}"
              data-change="1"
              aria-label="Increase quantity">+</button>
          </div>
        </div>

        <span class="cart-item-price">
          ₹${(price * item.quantity).toFixed(2)}
        </span>
      </div>
    `;
  }).join("");

  cartItems.querySelectorAll("button[data-id]").forEach(button => {
    button.addEventListener("click", () => {
      changeQuantity(
        button.dataset.id,
        Number(button.dataset.change)
      );
    });
  });
}

// OPEN OR CLOSE CART
function toggleCart(open) {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");

  if (!drawer || !backdrop) {
    console.error("Cart drawer or backdrop is missing.");
    return;
  }

  drawer.classList.toggle("open", open);
  backdrop.classList.toggle("visible", open);
}

// OPEN CHECKOUT
function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  toggleCart(false);

  const modal = document.getElementById("checkout-modal");

  if (modal) {
    modal.classList.add("visible");
  }
}

// CLOSE MODALS
function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("visible");
  }
}

function closeModalOnBackdrop(event, id) {
  if (event.target.id === id) {
    closeModal(id);
  }
}

// OPEN EMERGENCY INFORMATION
function showSOS() {
  const modal = document.getElementById("sos-modal");

  if (modal) {
    modal.classList.add("visible");
  }
}

// PLACE ORDER
async function placeOrder(event) {
  event.preventDefault();

  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  const form = document.getElementById("checkout-form");
  const nameInput = document.getElementById("customer-name");
  const addressInput = document.getElementById("customer-address");
  const paymentInput = document.getElementById("payment-method");

  if (!form || !nameInput || !addressInput || !paymentInput) {
    showToast("A checkout field is missing.");
    return;
  }

  const customerName = nameInput.value.trim();
  const address = addressInput.value.trim();

  if (!customerName || !address) {
    showToast("Please enter your name and delivery address.");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  // Keep the payment value compatible with the existing HTML.
  const payload = {
    customerName,
    address,
    paymentMethod: paymentInput.value,
    total: Number(getCartTotal().toFixed(2))
  };

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Placing order...";
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || "Order request failed: " + response.status
      );
    }

    // Some APIs return JSON, while others return an empty response.
    const responseText = await response.text();
    let result = null;

    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
      } catch {
        result = responseText;
      }
    }

    console.log("Order response:", result);

    cart = [];
    renderCart();
    form.reset();
    closeModal("checkout-modal");

    showToast("Order placed successfully!");

  } catch (error) {
    console.error("Order submission error:", error);
    showToast(
      "Could not place order. Check the backend and /api/orders."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Place order";
    }
  }
}

// LOAD SAVED ORDERS
async function showOrders() {
  const modal = document.getElementById("orders-modal");
  const list = document.getElementById("orders-list");

  if (!modal || !list) {
    console.error("Orders modal or list is missing.");
    return;
  }

  modal.classList.add("visible");
  list.textContent = "Loading orders...";

  try {
    const response = await fetch("/api/orders");

    if (!response.ok) {
      throw new Error("Could not retrieve orders: " + response.status);
    }

    const orders = await response.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      list.innerHTML = `
        <p class="empty-cart">No orders found yet.</p>
      `;
      return;
    }

    list.innerHTML = orders.map(order => {
      const orderId = order.orderId ?? order.id ?? "Order";
      const name = order.customerName || "Customer";
      const status = order.status || "Received";
      const total = Number(order.total ?? 0);

      return `
        <article class="order-card">
          <div class="order-top">
            <strong>${escapeHTML(orderId)}</strong>
            <span class="order-status">${escapeHTML(status)}</span>
          </div>

          <p>Customer: ${escapeHTML(name)}</p>
          <p>Address: ${escapeHTML(order.address || "Not available")}</p>
          <p>Payment: ${escapeHTML(order.paymentMethod || "Not specified")}</p>

          <p>
            <strong>
              Total: ₹${Number.isFinite(total) ? total.toFixed(2) : "0.00"}
            </strong>
          </p>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Order history error:", error);
    list.textContent =
      "Could not load orders. Check GET /api/orders.";
  }
}

// TOAST MESSAGE
function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2800);
}

// CHECKOUT FORM SUBMISSION
const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {
  checkoutForm.addEventListener("submit", placeOrder);
}

// ESCAPE KEY CLOSES OPEN PANELS
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    toggleCart(false);
    closeModal("checkout-modal");
    closeModal("orders-modal");
    closeModal("sos-modal");
  }
});

// INITIALIZE THE PAGE
renderCart();
loadMedicines();
