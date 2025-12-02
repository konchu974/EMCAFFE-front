// === CONFIG ===
const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ destination.js loaded");

  /* ---------------------------------------------------------
    AUTH HELPERS
  --------------------------------------------------------- */
  function isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  /* ---------------------------------------------------------
    DOM ELEMENTS
  --------------------------------------------------------- */
  const stepOne = document.getElementById("stepOne");
  const stepTwo = document.getElementById("stepTwo");
  const stepThree = document.getElementById("stepThree");
  const stepFour = document.getElementById("stepFour");

  const btnToStep2 = document.getElementById("toStep2");
  const btnToStep3 = document.getElementById("toStep3");
  const btnToStep4 = document.getElementById("toStep4");

  const btnBackToStep1 = document.getElementById("backToStep1");
  const btnBackToStep2 = document.getElementById("backToStep2");
  const btnBackToStep3 = document.getElementById("backToStep3");

  const deliveryForm = document.getElementById("deliveryForm");

  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  const deliveryAddress = document.getElementById("deliveryAddress");
  const deliveryAddress2 = document.getElementById("deliveryAddress2");
  const deliveryCity = document.getElementById("deliveryCity");
  const deliveryPostal = document.getElementById("deliveryPostal");
  const deliveryCountry = document.getElementById("deliveryCountry");
  const deliveryPhone = document.getElementById("deliveryPhone");

  let deliveryCost = 5;

  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  /* ---------------------------------------------------------
    AUTO-SKIP STEP 1 FOR LOGGED-IN USER
  --------------------------------------------------------- */
  if (isLoggedIn()) {
    console.log("User logged in → skipping Step 1");

    stepOne.classList.add("hidden");
    stepTwo.classList.remove("hidden");

    if (btnBackToStep1) btnBackToStep1.classList.add("hidden");

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      deliveryAddress.value = user.address_line1 || "";
      deliveryAddress2.value = user.address_line2 || "";
      deliveryPostal.value = user.postal_code || "";
      deliveryCity.value = user.city || "";
      deliveryCountry.value = user.country || "France";
      deliveryPhone.value = user.phone || "";
    }
  }

  /* ---------------------------------------------------------
     STEP 1 → STEP 2
  --------------------------------------------------------- */
  btnToStep2?.addEventListener("click", () => {
    if (isLoggedIn()) {
      showStep(stepOne, stepTwo);
      return;
    }

    const email = emailInput.value.trim();
    const pass = passwordInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return alert("Email invalide");

    if (pass.length < 6)
      return alert("Mot de passe : 6 caractères minimum");

    showStep(stepOne, stepTwo);
  });

  /* ---------------------------------------------------------
     STEP 2 → STEP 3
  --------------------------------------------------------- */
  btnToStep3?.addEventListener("click", () => {
    const required = stepTwo.querySelectorAll("input[required], select[required]");

    for (const field of required) {
      if (!field.value.trim()) return alert("Veuillez remplir tous les champs");
    }

    showStep(stepTwo, stepThree);
  });

  btnBackToStep1?.addEventListener("click", () => {
    if (isLoggedIn()) return;
    showStep(stepTwo, stepOne);
  });

  /* ---------------------------------------------------------
     STEP 3 → STEP 4
  --------------------------------------------------------- */
  btnToStep4?.addEventListener("click", () => {
    showStep(stepThree, stepFour);
    renderSummaryCard();
  });

  btnBackToStep2?.addEventListener("click", () => showStep(stepThree, stepTwo));

  /* ---------------------------------------------------------
     STEP 4 ← BACK TO STEP 3
  --------------------------------------------------------- */
  btnBackToStep3?.addEventListener("click", () => {
    showStep(stepFour, stepThree);
  });

  /* ---------------------------------------------------------
     DELIVERY COST
  --------------------------------------------------------- */
  deliveryForm?.addEventListener("change", (e) => {
    deliveryCost = e.target.value === "express" ? 10 : 5;
    localStorage.setItem("deliveryCost", deliveryCost);
    renderSummaryCard();
  });

  function renderSummaryCard() {
    const itemsEl = document.getElementById("summaryItems");
    const delEl = document.getElementById("summaryDelivery");
    const totEl = document.getElementById("summaryTotal");

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    itemsEl.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      itemsEl.innerHTML += `
        <div class="flex justify-between border-b pb-1">
          <span>${item.name} x${item.quantity}</span>
          <span>${subtotal.toFixed(2)}€</span>
        </div>
      `;
    });

    delEl.textContent = deliveryCost.toFixed(2) + "€";
    totEl.textContent = (total + deliveryCost).toFixed(2) + "€";
  }

  renderSummaryCard();

  /* ---------------------------------------------------------
     PAYMENT UI
  --------------------------------------------------------- */
  const cardRadio = document.querySelector('input[value="card"]');
  const bankRadio = document.querySelector('input[value="bank_transfer"]');

  const bankInfo = document.getElementById("bankInfoSection");
  const cardSection = document.getElementById("cardFormSection");

  function updatePaymentUI() {
    if (bankRadio.checked) {
      bankInfo.classList.remove("hidden");
      cardSection.classList.add("hidden");
    } else {
      bankInfo.classList.add("hidden");
      cardSection.classList.remove("hidden");
      initStripe();
    }
  }

  cardRadio?.addEventListener("change", updatePaymentUI);
  bankRadio?.addEventListener("change", updatePaymentUI);

  bankRadio.checked = true;
  updatePaymentUI();

  /* ---------------------------------------------------------
     STRIPE SETUP
  --------------------------------------------------------- */
  let stripe = null;
  let elements = null;
  let cardElement = null;

  function initStripe() {
    if (stripe) return;

    stripe = Stripe(STRIPE_PUBLIC_KEY);
    elements = stripe.elements();
    cardElement = elements.create("card");
    cardElement.mount("#card-element");
  }

  /* ---------------------------------------------------------
     SAVE ADDRESS TO BACKEND
  --------------------------------------------------------- */
 async function saveAddressToBackend() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const body = {
  address_line1: deliveryAddress.value,
  address_line2: deliveryAddress2.value,
  city: deliveryCity.value,
  postal_code: deliveryPostal.value,
  country: deliveryCountry.value,
  phone: deliveryPhone.value,
};


  try {
    const res = await fetch(`${API_BASE_URL}/users/address`, {
      method: "PUT",   
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to update address");

    const updated = await res.json();

    localStorage.setItem("user", JSON.stringify(updated.data));

    console.log("📦 Address saved!");
  } catch (err) {
    console.error("❌ Failed to save address:", err);
  }
}

  /* ---------------------------------------------------------
     PLACE ORDER
  --------------------------------------------------------- */
  document.getElementById("placeOrder")?.addEventListener("click", async () => {
    const total = parseFloat(
      document.getElementById("summaryTotal").textContent.replace("€", "")
    );

    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    )?.value;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.id_user_account) {
      return alert("Vous devez être connecté.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const data = {
      userId: user.id_user_account,
      amount: total,
      delivery_address: deliveryAddress.value,
      delivery_address2: deliveryAddress2.value,
      delivery_city: deliveryCity.value,
      delivery_postal_code: deliveryPostal.value,
      delivery_country: deliveryCountry.value,
      delivery_phone: deliveryPhone.value,
    };

    /* -------------------- BANK TRANSFER -------------------- */
    if (paymentMethod === "bank_transfer") {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/bank-transfer`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error();

        const json = await res.json();

        await saveAddressToBackend(); // SAVE ADDRESS

        document.getElementById("bankReference").textContent =
          `ORDER-${json.orderId}`;
        document.getElementById("bankReferenceTwo").textContent =
          `ORDER-${json.orderId}`;
        document.getElementById("bankAmount").textContent =
          total.toFixed(2);
        document
          .getElementById("bankConfirmation")
          .classList.remove("hidden");

        alert("Commande enregistrée. Veuillez effectuer le virement bancaire.");
      } catch (err) {
        alert("Erreur pendant le paiement par virement.");
      }

      return;
    }

    /* -------------------- CARD PAYMENT -------------------- */
    if (paymentMethod === "card") {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/card`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error();

        const { clientSecret } = await res.json();

        const confirm = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (confirm.error) return alert(confirm.error.message);

        await saveAddressToBackend();

        alert("Paiement par carte réussi !");
      } catch (err) {
        alert("Erreur Stripe.");
      }
    }
  });
});
