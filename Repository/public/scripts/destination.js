// === CONFIG ===
const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";
;

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ destination.js loaded");

  // === STEPS ===
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

  let deliveryCost = 5;

  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  /* ---------------- STEP 1 ---------------- */
  btnToStep2?.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const pass = passwordInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return alert("Email invalide");

    if (pass.length < 6) return alert("Mot de passe : 6 caractères minimum");

    showStep(stepOne, stepTwo);
  });

  /* ---------------- STEP 2 ---------------- */
  btnToStep3?.addEventListener("click", () => {
    const required = stepTwo.querySelectorAll("input[required], select[required]");

    for (const field of required) {
      if (!field.value.trim()) return alert("Veuillez remplir tous les champs");
    }

    showStep(stepTwo, stepThree);
  });

  btnBackToStep1?.addEventListener("click", () => showStep(stepTwo, stepOne));

  /* ---------------- STEP 3 ---------------- */
  btnToStep4?.addEventListener("click", () => {
    showStep(stepThree, stepFour);
    renderSummaryCard();
  });

  btnBackToStep2?.addEventListener("click", () => showStep(stepThree, stepTwo));

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

  /* ---------------- PAYMENT UI ---------------- */
  const cardRadio = document.querySelector('input[value="card"]');
  const bankRadio = document.querySelector('input[value="bank_transfer"]');

  const bankInfo = document.getElementById("bankInfoSection");
  const cardSection = document.getElementById("cardFormSection");

  function updatePaymentUI() {
    if (bankRadio.checked) {
      bankInfo.classList.remove("hidden");
      cardSection.classList.add("hidden");
    } else {
      cardSection.classList.remove("hidden");
      bankInfo.classList.add("hidden");
      initStripe();
    }
  }

  cardRadio?.addEventListener("change", updatePaymentUI);
  bankRadio?.addEventListener("change", updatePaymentUI);

  bankRadio.checked = true;
  updatePaymentUI();

  /* ---------------- STRIPE ---------------- */
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

  /* ---------------- PLACE ORDER ---------------- */
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

    // ---------------- DELIVERY INPUTS ----------------
const delivery_address = document.getElementById("deliveryAddress").value;
const delivery_city = document.getElementById("deliveryCity").value;
const delivery_postal_code = document.getElementById("deliveryPostal").value;
const delivery_country = document.getElementById("deliveryCountry").value;
const delivery_phone = document.getElementById("deliveryPhone").value;



    /* ---------------- BANK TRANSFER ---------------- */
    if (paymentMethod === "bank_transfer") {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/bank-transfer`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            userId: user.id_user_account,
            amount: total,
            delivery_address,
            delivery_city,
            delivery_postal_code,
            delivery_country,
            delivery_phone,
          }),
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        document.getElementById("bankReference").textContent = `ORDER-${data.orderId}`;
        document.getElementById("bankReferenceTwo").textContent = `ORDER-${data.orderId}`;
        document.getElementById("bankAmount").textContent = total.toFixed(2);
        document.getElementById("bankConfirmation").classList.remove("hidden");

        alert("Commande enregistrée. Veuillez effectuer le virement bancaire.");
      } catch (err) {
        alert("Erreur pendant le paiement par virement.");
      }

      return;
    }

    /* ---------------- CARD PAYMENT ---------------- */
    if (paymentMethod === "card") {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/card`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            userId: user.id_user_account,
            amount: total,
            delivery_address,
            delivery_city,
            delivery_postal_code,
            delivery_country,
            delivery_phone,
          }),
        });

        if (!res.ok) throw new Error();

        const { clientSecret } = await res.json();

        const confirm = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

        if (confirm.error) return alert(confirm.error.message);

        alert("Paiement par carte réussi !");
      } catch (err) {
        alert("Erreur Stripe.");
      }
    }
  });
});
