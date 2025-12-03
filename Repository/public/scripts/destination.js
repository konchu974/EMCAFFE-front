
const STRIPE_PUBLIC_KEY =
  "pk_test_51SVYto14tHXOJjU15ghHpxe0AP3n8abWKIuwHbRX3oQ55wVLmiHsdZNMVsDeAFuPJEVmknhbHLMLu6Ky0HEEHnRp00gKixVHNi";

const API_BASE_URL = "https://api-emcafe-3.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  console.log("destination.js loaded");

  const isLoggedIn = () => !!localStorage.getItem("token");
  const getToken = () => localStorage.getItem("token");
  const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

  let addresses = [];
  let selectedAddressId = null;
  let editingAddressId = null;

  const stepOne = document.getElementById("stepOne");
  const stepTwo = document.getElementById("stepTwo");
  const stepThree = document.getElementById("stepThree");
  const stepFour = document.getElementById("stepFour");

  const addressList = document.getElementById("addressList");
  const addressForm = document.getElementById("addressForm");
  const showAddressFormBtn = document.getElementById("showAddressForm");


  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const deliveryAddress = document.getElementById("deliveryAddress");
  const deliveryAddress2 = document.getElementById("deliveryAddress2");
  const deliveryCity = document.getElementById("deliveryCity");
  const deliveryPostal = document.getElementById("deliveryPostal");
  const deliveryCountry = document.getElementById("deliveryCountry");
  const deliveryPhone = document.getElementById("deliveryPhone");

  const btnToStep2 = document.getElementById("toStep2");
  const btnToStep3 = document.getElementById("toStep3");
  const btnToStep4 = document.getElementById("toStep4");
  const backToStep1 = document.getElementById("backToStep1");
  const backToStep2 = document.getElementById("backToStep2");
  const backToStep3 = document.getElementById("backToStep3");

  const saveAddressBtn = document.getElementById("saveAddressBtn");
  const cancelAddressForm = document.getElementById("cancelAddressForm");

  // ================================================
  // STEP NAVIGATION
  // ================================================
  function showStep(hideEl, showEl) {
    hideEl.classList.add("hidden");
    showEl.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });
  }
/* ---------------------------------------------------------
  VARIABLES GLOBALES
--------------------------------------------------------- */
let isGuestMode = false;
let currentUser = null;

/* ---------------------------------------------------------
  AUTO-SKIP STEP 1 FOR LOGGED-IN USER
--------------------------------------------------------- */
if (isLoggedIn()) {
  console.log("✅ User logged in → skipping Step 1");

  stepOne?.classList.add("hidden");
  stepTwo?.classList.remove("hidden");

  if (btnBackToStep1) btnBackToStep1.classList.add("hidden");

  // Masquer le champ email invité
  const guestEmailField = document.getElementById("guestEmailField");
  if (guestEmailField) {
    guestEmailField.classList.add("hidden");
  }

  const user = userService.getCurrentUser();
  currentUser = user;

  if (user) {
    // Pré-remplir TOUS les champs
    const deliveryFirstName = document.getElementById("deliveryFirstName");
    const deliveryLastName = document.getElementById("deliveryLastName");
    const deliveryAddress = document.getElementById("deliveryAddress");
    const deliveryAddress2 = document.getElementById("deliveryAddress2");
    const deliveryPhone = document.getElementById("deliveryPhone");
    const deliveryPostal = document.getElementById("deliveryPostal");
    const deliveryCity = document.getElementById("deliveryCity");
    const deliveryCountry = document.getElementById("deliveryCountry");

    if (deliveryFirstName) deliveryFirstName.value = user.first_name || "";
    if (deliveryLastName) deliveryLastName.value = user.last_name || "";
    if (deliveryAddress) deliveryAddress.value = user.address_line1 || "";
    if (deliveryAddress2) deliveryAddress2.value = user.address_line2 || "";
    if (deliveryPhone) deliveryPhone.value = user.phone || "";
    if (deliveryPostal) deliveryPostal.value = user.postal_code || "";
    if (deliveryCity) deliveryCity.value = user.city || "";
    if (deliveryCountry) deliveryCountry.value = user.country || "France";
  }
}

/* ---------------------------------------------------------
   ÉCOUTER L'ÉVÉNEMENT DE CONNEXION DEPUIS AuthForm
--------------------------------------------------------- */
window.addEventListener('proceed-to-step2', (e) => {
  const { user, isGuest } = e.detail;

  console.log('📨 Event proceed-to-step2 reçu');
  
  // Sauvegarder l'état
  isGuestMode = isGuest;
  currentUser = user;

  const guestEmailField = document.getElementById("guestEmailField");
  const deliveryEmail = document.getElementById("deliveryEmail");

  if (isGuest) {
    // MODE INVITÉ
    console.log('🎭 Mode invité - Affichage du champ email');
    
    if (guestEmailField) {
      guestEmailField.classList.remove("hidden");
    }
    if (deliveryEmail) {
      deliveryEmail.setAttribute("required", "required");
    }
    
  } else {
    // MODE CONNECTÉ
    console.log('✅ Utilisateur connecté:', user);

    if (guestEmailField) {
      guestEmailField.classList.add("hidden");
    }
    if (deliveryEmail) {
      deliveryEmail.removeAttribute("required");
    }

    // Pré-remplir TOUS les champs
    if (user) {
      const deliveryFirstName = document.getElementById("deliveryFirstName");
      const deliveryLastName = document.getElementById("deliveryLastName");
      const deliveryAddress = document.getElementById("deliveryAddress");
      const deliveryAddress2 = document.getElementById("deliveryAddress2");
      const deliveryPhone = document.getElementById("deliveryPhone");
      const deliveryPostal = document.getElementById("deliveryPostal");
      const deliveryCity = document.getElementById("deliveryCity");
      const deliveryCountry = document.getElementById("deliveryCountry");

      if (deliveryFirstName) deliveryFirstName.value = user.first_name || "";
      if (deliveryLastName) deliveryLastName.value = user.last_name || "";
      if (deliveryAddress) deliveryAddress.value = user.address_line1 || "";
      if (deliveryAddress2) deliveryAddress2.value = user.address_line2 || "";
      if (deliveryPhone) deliveryPhone.value = user.phone || "";
      if (deliveryPostal) deliveryPostal.value = user.postal_code || "";
      if (deliveryCity) deliveryCity.value = user.city || "";
      if (deliveryCountry) deliveryCountry.value = user.country || "France";
    }
  }

  // Masquer le bouton retour pour les utilisateurs connectés
  if (!isGuest && btnBackToStep1) {
    btnBackToStep1.classList.add("hidden");
  }

  // Passer à l'étape 2
  showStep(stepOne, stepTwo);
});

/* ---------------------------------------------------------
   STEP 2 → STEP 3 (Validation complète)
--------------------------------------------------------- */
btnToStep3?.addEventListener("click", () => {
  const guestEmailField = document.getElementById("guestEmailField");
  const deliveryEmail = document.getElementById("deliveryEmail");
  const deliveryFirstName = document.getElementById("deliveryFirstName");
  const deliveryLastName = document.getElementById("deliveryLastName");
  const deliveryAddress = document.getElementById("deliveryAddress");
  const deliveryPostal = document.getElementById("deliveryPostal");
  const deliveryCity = document.getElementById("deliveryCity");
  const deliveryPhone = document.getElementById("deliveryPhone");
  const deliveryCountry = document.getElementById("deliveryCountry");

  // Validation email pour les invités
  if (isGuestMode && !guestEmailField?.classList.contains("hidden")) {
    const email = deliveryEmail?.value.trim();
    if (!email) {
      return alert("Veuillez renseigner votre email");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return alert("Veuillez renseigner un email valide");
    }
    console.log("📧 Email invité:", email);
  }

  // Validation des champs obligatoires
  if (!deliveryFirstName?.value.trim()) {
    return alert("Veuillez renseigner votre prénom");
  }
  if (!deliveryLastName?.value.trim()) {
    return alert("Veuillez renseigner votre nom");
  }
  if (!deliveryAddress?.value.trim()) {
    return alert("Veuillez renseigner votre adresse");
  }
  if (!deliveryPostal?.value.trim()) {
    return alert("Veuillez renseigner votre code postal");
  }
  if (!deliveryCity?.value.trim()) {
    return alert("Veuillez renseigner votre ville");
  }
  if (!deliveryPhone?.value.trim()) {
    return alert("Veuillez renseigner votre téléphone");
  }
  if (!deliveryCountry?.value.trim()) {
    return alert("Veuillez sélectionner un pays");
  }

  console.log("✅ Validation Step 2 réussie");
  console.log("📦 Données:", {
    email: isGuestMode ? deliveryEmail?.value : currentUser?.email,
    firstName: deliveryFirstName?.value,
    lastName: deliveryLastName?.value,
    address: deliveryAddress?.value,
    postal: deliveryPostal?.value,
    city: deliveryCity?.value,
    phone: deliveryPhone?.value,
    country: deliveryCountry?.value,
    isGuest: isGuestMode
  });

  showStep(stepTwo, stepThree);
});

/* ---------------------------------------------------------
   NAVIGATION RETOUR
--------------------------------------------------------- */
btnBackToStep1?.addEventListener("click", () => {
  // Empêcher le retour si connecté
  if (isLoggedIn()) {
    console.log("⚠️ Impossible de revenir en arrière (déjà connecté)");
    return;
  }
  
  // Permettre le retour uniquement pour les invités
  if (isGuestMode) {
    showStep(stepTwo, stepOne);
  }
});


 

  /* ---------------------------------------------------------
     STEP 4 ← BACK TO STEP 3
  --------------------------------------------------------- */
  btnBackToStep3?.addEventListener("click", () => {
    showStep(stepFour, stepThree);
  });
/* ---------------------------------------------------------
   DELIVERY COST - VERSION COMPLÈTE
--------------------------------------------------------- */

deliveryForm?.addEventListener("change", (e) => {
const target = e.target;
  
  if (target.name === 'deliverySpeed') {
    // Calculer le coût selon l'option choisie
    if (target.value === "express") {
      deliveryCost = 10;
    } else if (target.value === "relay") {
      deliveryCost = 3.5;
    } else if (target.value === "standard") {
      deliveryCost = 5;
    }
    
    localStorage.setItem("deliveryCost", deliveryCost.toString());
    console.log('💰 Coût de livraison mis à jour:', deliveryCost);
    renderSummaryCard();
  }
});

/* ---------------------------------------------------------
   RENDER SUMMARY CARD - VERSION AMÉLIORÉE
--------------------------------------------------------- */
function renderSummaryCard() {
  const itemsEl = document.getElementById("summaryItems");
  const delEl = document.getElementById("summaryDelivery");
  const totEl = document.getElementById("summaryTotal");

  if (!itemsEl || !delEl || !totEl) {
    console.warn('⚠️ Éléments du summary non trouvés');
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  itemsEl.innerHTML = "";
  let subtotal = 0;

  // Afficher chaque article
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    itemsEl.innerHTML += `
      <div class="flex justify-between border-b border-[#5C3F32]/20 pb-2 mb-2">
        <span class="text-sm">${item.name} <span class="text-[#A47343]">x${item.quantity}</span></span>
        <span class="text-sm font-medium">${itemTotal.toFixed(2)}€</span>
      </div>
    `;
  });

  // Si le panier est vide
  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <p class="text-center text-[#A47343] text-sm italic">Votre panier est vide</p>
    `;
  }

  // Calculer le total final
  const total = subtotal + deliveryCost;

  // Mettre à jour l'affichage
  delEl.textContent = deliveryCost.toFixed(2) + "€";
  totEl.textContent = total.toFixed(2) + "€";

  // Sauvegarder pour d'autres parties de l'application
  sessionStorage.setItem('cartSubtotal', subtotal.toFixed(2));
  sessionStorage.setItem('deliveryCost', deliveryCost.toFixed(2));
  sessionStorage.setItem('cartTotal', total.toFixed(2));

  console.log('📊 Summary Card:', { subtotal, deliveryCost, total });
}

// Initialiser le rendu
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

  bankRadio.checked = true;
  updatePaymentUI();

  bankRadio.addEventListener("change", updatePaymentUI);
  cardRadio.addEventListener("change", updatePaymentUI);

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

  // ================================================
  // PLACE ORDER
  // ================================================
  document.getElementById("placeOrder")?.addEventListener("click", async () => {
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    ).value;

    const amount = parseFloat(
      document.getElementById("summaryTotal").textContent.replace("€", "")
    );

    const user = getUser();

    const data = {
      userId: user.id_user_account,
      addressId: selectedAddressId,
      amount
    };

    if (paymentMethod === "bank_transfer") {
      alert("Virement enregistré.");
      return;
    }

    // CARD
    const res = await fetch(`${API_BASE_URL}/payments/card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    const { clientSecret } = await res.json();

    const confirm = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    if (confirm.error) return alert(confirm.error.message);

    alert("Paiement effectué !");
  });

  // Load addresses immediately if logged in
  if (isLoggedIn()) loadAddressesFromBackend();
});
