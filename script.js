const accordionButtons = document.querySelectorAll(".accordion-toggle");
const brandCipher = document.querySelector(".brand-cipher");
const shopPreviewImage = document.querySelector(".shop-left-hero__image");
const filterChips = document.querySelectorAll(".filter-chip[data-filter]");
const previewCards = document.querySelectorAll(".catalog-card[data-preview-src]");
const productCards = document.querySelectorAll(".catalog-card[data-product-card]");
const shopFeature = document.querySelector(".shop-feature");
const featureLabel = document.querySelector("#shop-feature-label");
const featureTitle = document.querySelector("#shop-feature-title");
const featurePrice = document.querySelector("#shop-feature-price");
const featureText = document.querySelector("#shop-feature-text");
const featureImage = document.querySelector("#shop-feature-image");
const featureDots = document.querySelector("#shop-feature-dots");
const shopFeatureCloseButton = document.querySelector(".shop-feature__close");
const galleryButtons = document.querySelectorAll("[data-gallery-nav]");
const networkAccordion = document.querySelector("[data-network-accordion]");
const cityToggle = document.querySelector("#city-toggle");
const cityCurrent = document.querySelector("#city-current");
const cityList = document.querySelector("#city-list");
const currencyToggle = document.querySelector("#currency-toggle");
const currencyCurrent = document.querySelector("#currency-current");
const currencyList = document.querySelector("#currency-list");
const currencyRows = document.querySelectorAll(".currency-row");
const addToCartButton = document.querySelector(".add-to-cart");
const cartPageItems = document.querySelector("#cart-page-items");
const cartPageCount = document.querySelector("#cart-page-count");
const cartSummaryItems = document.querySelector("#cart-summary-items");
const cartSummaryTotal = document.querySelector("#cart-summary-total");
const cartEmailInput = document.querySelector("#cart-email");
const cartPayButton = document.querySelector("#cart-pay-button");
const cartMessage = document.querySelector("#cart-message");
const cartMessageEmail = document.querySelector("#cart-message-email");
const cartIndicators = document.querySelectorAll("[data-cart-indicator]");
const cartStorageKey = "dista-cart-items";
let addToCartFeedbackTimer = null;
const mobileShopMediaQuery =
  typeof window !== "undefined" ? window.matchMedia("(max-width: 900px)") : null;

const currencyRates = {
  USD: 1,
  RUB: 80,
  EUR: 0.87,
  AED: 3.67,
  CNY: 7.2,
};

const cityOptionsByCategory = {
  curated: [
    "Moscow, Russia",
    "Tokyo, Japan",
    "Dubai, UAE",
    "Sao Paulo, Brazil",
    "London, United Kingdom",
    "Paris, France",
  ],
  merch: [
    "Moscow, Russia",
    "Tokyo, Japan",
    "Dubai, UAE",
    "Sao Paulo, Brazil",
    "London, United Kingdom",
    "Paris, France",
  ],
  exchange: [
    "Moscow, Russia",
    "Tokyo, Japan",
    "Abu Dhabi, UAE",
  ],
};

const formatCurrencyPrice = (amount, currency) => {
  if (currency === "USD") {
    return `$${Math.round(amount)}`;
  }

  if (currency === "RUB") {
    return `₽${Math.round(amount)}`;
  }

  if (currency === "EUR") {
    return `€${Math.round(amount)}`;
  }

  if (currency === "AED") {
    return `${Math.round(amount)} AED`;
  }

  if (currency === "CNY") {
    return `¥${Math.round(amount)}`;
  }

  return `${Math.round(amount)}`;
};

const darkenHex = (hexColor, amount = 0.22) => {
  const hex = hexColor.replace("#", "");
  const normalized =
    hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;

  const channels = normalized.match(/.{2}/g);
  if (!channels) {
    return hexColor;
  }

  const [r, g, b] = channels.map((channel) => Number.parseInt(channel, 16));
  const darken = (value) => Math.max(0, Math.round(value * (1 - amount)));

  return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
};

const readCartItems = () => {
  try {
    const raw = window.localStorage.getItem(cartStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCartItems = (items) => {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const syncCartIndicators = () => {
  const totalQuantity = readCartItems().reduce((sum, item) => sum + item.quantity, 0);
  cartIndicators.forEach((indicator) => {
    indicator.textContent = `(${totalQuantity})`;
  });
};

const renderCartPage = () => {
  if (!cartPageItems || !cartPageCount || !cartSummaryItems || !cartSummaryTotal) {
    return;
  }

  const items = readCartItems();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0);

  cartPageCount.textContent = `${totalQuantity}`;
  cartSummaryItems.textContent = `${totalQuantity}`;
  cartSummaryTotal.textContent = formatCurrencyPrice(totalAmount, "USD");

  if (items.length === 0) {
    cartPageItems.innerHTML =
      '<p class="cart-minimal-empty">Choose any box, exchange or merch item on the shop page and it will appear here.</p>';
    return;
  }

  cartPageItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-minimal-item" data-cart-id="${item.id}">
          <div class="cart-minimal-item__image">
            <img src="${item.image}" alt="${item.title}" />
          </div>
          <div class="cart-minimal-item__copy">
            <p class="cart-minimal-item__label">${item.label}</p>
            <p class="cart-minimal-item__title">${item.title}</p>
            <p class="cart-minimal-item__meta">${item.city}</p>
            <p class="cart-minimal-item__price">${formatCurrencyPrice(
              item.priceUsd * item.quantity,
              "USD",
            )}</p>
          </div>
          <div class="cart-minimal-item__controls">
            <div class="cart-minimal-qty">
              <button type="button" data-cart-action="decrease">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-action="increase">+</button>
            </div>
            <button class="cart-minimal-remove" type="button" data-cart-action="remove">remove</button>
          </div>
        </article>
      `,
    )
    .join("");
};

syncCartIndicators();

if (cartPageItems) {
  renderCartPage();

  cartPageItems.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const actionButton = target.closest("[data-cart-action]");
    const cartItem = target.closest("[data-cart-id]");
    if (!actionButton || !cartItem) {
      return;
    }

    const itemId = cartItem.getAttribute("data-cart-id") || "";
    const action = actionButton.getAttribute("data-cart-action") || "";
    const items = readCartItems();
    const nextItems = items
      .map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (action === "increase") {
          return { ...item, quantity: item.quantity + 1 };
        }

        if (action === "decrease") {
          return { ...item, quantity: item.quantity - 1 };
        }

        return item;
      })
      .filter((item) => {
        if (item.id !== itemId) {
          return true;
        }

        if (action === "remove") {
          return false;
        }

        return item.quantity > 0;
      });

    writeCartItems(nextItems);
    syncCartIndicators();
    renderCartPage();
  });
}

const showAddToCartFeedback = () => {
  if (!addToCartButton) {
    return;
  }

  if (addToCartFeedbackTimer) {
    window.clearTimeout(addToCartFeedbackTimer);
  }

  addToCartButton.classList.add("is-added");
  addToCartButton.textContent = "ADDED TO CART";

  addToCartFeedbackTimer = window.setTimeout(() => {
    addToCartButton.classList.remove("is-added");
    addToCartButton.textContent = "ADD TO CART";
    addToCartFeedbackTimer = null;
  }, 1100);
};

const isMobileShopLayout = () => mobileShopMediaQuery?.matches ?? false;

const openMobileShopFeature = () => {
  if (!shopFeature || !isMobileShopLayout()) {
    return;
  }

  shopFeature.classList.add("is-mobile-open");
  shopFeature.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-shop-overlay-open");
};

const closeMobileShopFeature = () => {
  if (!shopFeature) {
    return;
  }

  shopFeature.classList.remove("is-mobile-open");
  shopFeature.setAttribute("aria-hidden", String(isMobileShopLayout()));
  document.body.classList.remove("is-shop-overlay-open");
};

const showCartMessage = (email) => {
  if (!cartMessage || !cartMessageEmail) {
    return;
  }

  cartMessageEmail.textContent = email;
  cartMessage.hidden = false;
};

if (networkAccordion) {
  const networkPanels = Array.from(networkAccordion.querySelectorAll(".network-panel"));

  networkPanels.forEach((panel) => {
    const toggle = panel.querySelector(".network-panel__header");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      networkPanels.forEach((otherPanel) => {
        const otherToggle = otherPanel.querySelector(".network-panel__header");
        const isCurrent = otherPanel === panel;

        otherPanel.classList.toggle("is-open", isCurrent);

        if (otherToggle) {
          otherToggle.setAttribute("aria-expanded", String(isCurrent));
        }
      });
    });
  });
}

if (cartPayButton && cartEmailInput) {
  cartPayButton.addEventListener("click", () => {
    const email = cartEmailInput.value.trim();

    if (!isValidEmail(email)) {
      cartEmailInput.focus();
      cartEmailInput.setAttribute("aria-invalid", "true");
      return;
    }

    cartEmailInput.removeAttribute("aria-invalid");
    showCartMessage(email);
  });

  cartEmailInput.addEventListener("input", () => {
    cartEmailInput.removeAttribute("aria-invalid");
    if (cartMessage) {
      cartMessage.hidden = true;
    }
  });
}

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const isOpen = button.getAttribute("aria-expanded") === "true";

    accordionButtons.forEach((otherButton) => {
      otherButton.setAttribute("aria-expanded", "false");
      otherButton.nextElementSibling.classList.remove("is-open");
      otherButton.nextElementSibling.style.maxHeight = "0px";
    });

    if (!isOpen) {
      button.setAttribute("aria-expanded", "true");
      panel.classList.add("is-open");
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
  });
});

if (brandCipher) {
  const words = (brandCipher.dataset.words || "DISTA").split(",");
  const scrambleChars = "!@#$%^&*()_+-=[]{};:,.<>?/|~`№§¶※†‡¢£¥€¡¿";
  let wordIndex = 0;

  const randomChar = () =>
    scrambleChars[Math.floor(Math.random() * scrambleChars.length)];

  const animateWord = (targetWord) => {
    const maxLength = Math.max(targetWord.length, brandCipher.textContent.length);
    let frame = 0;
    const totalFrames = 22;

    const interval = setInterval(() => {
      let next = "";

      for (let i = 0; i < maxLength; i += 1) {
        if (frame > 11 + i && targetWord[i]) {
          next += targetWord[i];
        } else if (frame > totalFrames && targetWord[i]) {
          next += targetWord[i];
        } else {
          next += randomChar();
        }
      }

      brandCipher.textContent = next.slice(0, maxLength);
      frame += 1;

      if (frame > totalFrames) {
        clearInterval(interval);
        brandCipher.textContent = targetWord;

        setTimeout(() => {
          wordIndex = (wordIndex + 1) % words.length;
          animateWord(words[wordIndex]);
        }, 1400);
      }
    }, 60);
  };

  setTimeout(() => {
    wordIndex = 1 % words.length;
    animateWord(words[wordIndex]);
  }, 1200);
}

if (shopPreviewImage && previewCards.length > 0) {
  const defaultSrc = shopPreviewImage.dataset.defaultSrc || shopPreviewImage.src;
  const defaultAlt = shopPreviewImage.dataset.defaultAlt || shopPreviewImage.alt;
  let selectedSrc = defaultSrc;
  let selectedAlt = defaultAlt;

  const applyLeftPreview = (src, alt) => {
    shopPreviewImage.src = src;
    shopPreviewImage.alt = alt;
  };

  previewCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const nextSrc = card.dataset.previewSrc;
      const nextAlt = card.dataset.previewAlt;

      if (nextSrc) {
        applyLeftPreview(nextSrc, nextAlt || shopPreviewImage.alt);
      }
    });

    card.addEventListener("mouseleave", () => {
      applyLeftPreview(selectedSrc, selectedAlt);
    });

    card.addEventListener("click", () => {
      const nextSrc = card.dataset.previewSrc;
      const nextAlt = card.dataset.previewAlt;

      if (nextSrc) {
        selectedSrc = nextSrc;
        selectedAlt = nextAlt || selectedAlt;
        applyLeftPreview(selectedSrc, selectedAlt);
      }
    });
  });
}

if (featureImage && featureDots && galleryButtons.length > 0) {
  const defaultGallery = (featureImage.dataset.defaultGallery || featureImage.src).split("|");
  const defaultAlts = (featureImage.dataset.defaultGalleryAlts || featureImage.alt).split("|");
  const galleryState = {
    images: defaultGallery,
    alts: defaultAlts,
    index: 0,
    zoom: 1,
    zooms: [],
    shiftX: 0,
    shiftY: 0,
    shifts: [],
  };
  const pricingState = {
    baseUsd: 15,
    currency: "USD",
  };
  const cityState = {
    current: "",
  };
  let currentProduct = null;
  let selectedProductCard = null;

  if (isMobileShopLayout()) {
    shopFeature?.setAttribute("aria-hidden", "true");
  }

  const buildCurrentProduct = (card) => {
    const gallery = (card.dataset.productGallery || "").split("|").filter(Boolean);
    const fallbackImage = card.querySelector(".catalog-card__image img")?.getAttribute("src") || "";
    const image = gallery[0] || fallbackImage;
    const title = card.dataset.productTitle || card.querySelector("h2")?.textContent || "Item";
    const city = cityState.current || "Location not selected";

    return {
      id: `${title}__${city}`,
      label: card.dataset.productLabel || "",
      title,
      city,
      image,
      priceUsd: Number(card.dataset.productPrice.replace(/[^0-9.]/g, "")) || 0,
    };
  };

  const syncCityOptions = (category) => {
    if (!cityList || !cityCurrent) {
      return;
    }

    const nextOptions = cityOptionsByCategory[category] || cityOptionsByCategory.curated;
    const nextCurrent = nextOptions.includes(cityState.current)
      ? cityState.current
      : nextOptions[0] || "";

    cityState.current = nextCurrent;
    cityCurrent.textContent = nextCurrent;
    cityList.innerHTML = "";

    nextOptions.forEach((city) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "select-row city-row";
      row.dataset.city = city;
      row.textContent = city;
      row.classList.toggle("is-active", city === cityState.current);
      cityList.appendChild(row);
    });
  };

  const syncCurrencyUi = () => {
    const convertedAmount =
      pricingState.baseUsd * (currencyRates[pricingState.currency] || currencyRates.USD);

    if (featurePrice) {
      featurePrice.textContent = formatCurrencyPrice(convertedAmount, pricingState.currency);
    }

    currencyRows.forEach((row) => {
      const rowCurrency = row.dataset.currency || "USD";
      const rowAmount = pricingState.baseUsd * (currencyRates[rowCurrency] || currencyRates.USD);
      const valueNode = row.querySelector("span:last-child");

      row.classList.toggle("is-active", rowCurrency === pricingState.currency);

      if (valueNode) {
        valueNode.textContent = formatCurrencyPrice(rowAmount, rowCurrency);
      }
    });

    if (currencyCurrent) {
      currencyCurrent.textContent = pricingState.currency;
    }
  };

  const setSelectListOpen = (toggle, list, isOpen) => {
    if (!toggle || !list) {
      return;
    }

    toggle.setAttribute("aria-expanded", String(isOpen));
    list.classList.toggle("is-open", isOpen);
    list.parentElement?.classList.toggle("is-open", isOpen);
  };

  const closeAllSelectLists = (exceptList = null) => {
    [
      [cityToggle, cityList],
      [currencyToggle, currencyList],
    ].forEach(([toggle, list]) => {
      if (!toggle || !list || list === exceptList) {
        return;
      }

      setSelectListOpen(toggle, list, false);
    });
  };

  const applyCardSelection = (card) => {
    productCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");

    const nextImages = (card.dataset.productGallery || "").split("|").filter(Boolean);
    const nextAlts = (card.dataset.productGalleryAlts || "").split("|").filter(Boolean);

    if (featureLabel && card.dataset.productLabel) {
      featureLabel.textContent = card.dataset.productLabel;
    }

    if (featureTitle && card.dataset.productTitle) {
      featureTitle.textContent = card.dataset.productTitle;
    }

    if (card.dataset.productPrice) {
      pricingState.baseUsd = Number(card.dataset.productPrice.replace(/[^0-9.]/g, "")) || 0;
    }

    if (featureText && card.dataset.productText) {
      featureText.textContent = card.dataset.productText;
    }

    if (shopFeature && card.dataset.productBg) {
      shopFeature.style.backgroundColor = card.dataset.productBg;
      shopFeature.style.setProperty("--feature-head", darkenHex(card.dataset.productBg));
    }

    if (card.dataset.category) {
      syncCityOptions(card.dataset.category);
    }

    currentProduct = buildCurrentProduct(card);

    if (nextImages.length > 0) {
      galleryState.images = nextImages;
      galleryState.alts = nextAlts.length > 0 ? nextAlts : nextImages.map(() => featureImage.alt);
      galleryState.index = 0;
      galleryState.zoom = Number(card.dataset.productZoom || 1);
      galleryState.zooms = (card.dataset.productZooms || "")
        .split("|")
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);
      galleryState.shiftX = Number(card.dataset.productShiftX || 0);
      galleryState.shiftY = Number(card.dataset.productShiftY || 0);
      galleryState.shifts = (card.dataset.productShifts || "")
        .split("|")
        .filter(Boolean)
        .map((value) => {
          const [x, y] = value.split(",").map(Number);
          return {
            x: Number.isFinite(x) ? x : 0,
            y: Number.isFinite(y) ? y : 0,
          };
        });
      renderGallery();
    }

    syncCurrencyUi();
  };

  const applyHoverPreview = (card) => {
    applyCardSelection(card);

    if (shopPreviewImage) {
      const nextSrc = card.dataset.previewSrc || shopPreviewImage.src;
      const nextAlt = card.dataset.previewAlt || shopPreviewImage.alt;
      shopPreviewImage.src = nextSrc;
      shopPreviewImage.alt = nextAlt;
    }
  };

  const renderDots = () => {
    featureDots.innerHTML = "";

    galleryState.images.forEach((_, index) => {
      const dot = document.createElement("span");
      if (index === galleryState.index) {
        dot.classList.add("is-active");
      }
      featureDots.appendChild(dot);
    });
  };

  const renderGallery = () => {
    featureImage.src = galleryState.images[galleryState.index];
    featureImage.alt = galleryState.alts[galleryState.index] || featureImage.alt;
    const activeZoom = galleryState.zooms[galleryState.index] || galleryState.zoom;
    const activeShift = galleryState.shifts[galleryState.index] || {
      x: galleryState.shiftX,
      y: galleryState.shiftY,
    };
    featureImage.style.transform = `translate(${activeShift.x}%, ${activeShift.y}%) scale(${activeZoom})`;
    renderDots();
  };

  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (galleryState.images.length <= 1) {
        return;
      }

      const direction = button.dataset.galleryNav;
      if (direction === "prev") {
        galleryState.index =
          (galleryState.index - 1 + galleryState.images.length) % galleryState.images.length;
      } else {
        galleryState.index = (galleryState.index + 1) % galleryState.images.length;
      }

      renderGallery();
    });
  });

  productCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      applyHoverPreview(card);
    });

    card.addEventListener("mouseleave", () => {
      if (!selectedProductCard) {
        return;
      }

      applyCardSelection(selectedProductCard);

      if (shopPreviewImage) {
        const nextSrc = selectedProductCard.dataset.previewSrc || defaultSrc;
        const nextAlt = selectedProductCard.dataset.previewAlt || defaultAlt;
        selectedSrc = nextSrc;
        selectedAlt = nextAlt;
        shopPreviewImage.src = nextSrc;
        shopPreviewImage.alt = nextAlt;
      }
    });

    card.addEventListener("click", () => {
      selectedProductCard = card;
      applyCardSelection(card);
      openMobileShopFeature();
    });
  });

  shopFeatureCloseButton?.addEventListener("click", () => {
    closeMobileShopFeature();
  });

  if (currencyToggle) {
    currencyToggle.addEventListener("click", () => {
      const isOpen = currencyToggle.getAttribute("aria-expanded") === "true";
      closeAllSelectLists();
      setSelectListOpen(currencyToggle, currencyList, !isOpen);
    });
  }

  currencyRows.forEach((row) => {
    row.addEventListener("click", () => {
      pricingState.currency = row.dataset.currency || "USD";
      syncCurrencyUi();
      setSelectListOpen(currencyToggle, currencyList, false);
    });
  });

  if (cityToggle) {
    cityToggle.addEventListener("click", () => {
      const isOpen = cityToggle.getAttribute("aria-expanded") === "true";
      closeAllSelectLists();
      setSelectListOpen(cityToggle, cityList, !isOpen);
    });
  }

  if (cityList) {
    cityList.addEventListener("click", (event) => {
      const row = event.target.closest("[data-city]");
      if (!row) {
        return;
      }

      cityState.current = row.dataset.city || "";
      cityCurrent.textContent = cityState.current;
      cityList.querySelectorAll("[data-city]").forEach((item) => {
        item.classList.toggle("is-active", item === row);
      });
      if (currentProduct) {
        currentProduct.city = cityState.current;
        currentProduct.id = `${currentProduct.title}__${currentProduct.city}`;
      }
      setSelectListOpen(cityToggle, cityList, false);
    });
  }

  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      if (!currentProduct) {
        return;
      }

      const items = readCartItems();
      const existingItem = items.find((item) => item.id === currentProduct.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        items.unshift({
          ...currentProduct,
          quantity: 1,
        });
      }

      writeCartItems(items);
      syncCartIndicators();
      showAddToCartFeedback();
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (!target.closest(".select-box")) {
      closeAllSelectLists();
    }
  });

  if (filterChips.length > 0) {
    const applyFilter = (filter) => {
      let firstVisibleProductCard = null;

      document.querySelectorAll(".catalog-card").forEach((card) => {
        const cardCategory = card.dataset.category || "all";
        const shouldShow = filter === "all" || cardCategory === filter;

        card.hidden = !shouldShow;

        if (shouldShow && !firstVisibleProductCard && card.hasAttribute("data-product-card")) {
          firstVisibleProductCard = card;
        }
      });

      filterChips.forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset.filter === filter);
      });

      if (firstVisibleProductCard) {
        selectedProductCard = firstVisibleProductCard;
        applyCardSelection(firstVisibleProductCard);

        if (shopPreviewImage) {
          const nextSrc = firstVisibleProductCard.dataset.previewSrc || defaultSrc;
          const nextAlt = firstVisibleProductCard.dataset.previewAlt || defaultAlt;
          selectedSrc = nextSrc;
          selectedAlt = nextAlt;
          shopPreviewImage.src = nextSrc;
          shopPreviewImage.alt = nextAlt;
        }
      }

      if (isMobileShopLayout()) {
        closeMobileShopFeature();
      }
    };

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        applyFilter(chip.dataset.filter || "all");
      });
    });
  }

  syncCityOptions("exchange");
  renderGallery();
  const initialProductCard =
    [...productCards].find((card) => card.dataset.productTitle === featureTitle?.textContent) ||
    productCards[0];

  if (initialProductCard) {
    selectedProductCard = initialProductCard;
    applyCardSelection(initialProductCard);
    if (isMobileShopLayout()) {
      closeMobileShopFeature();
    }
  } else {
    syncCurrencyUi();
  }

  mobileShopMediaQuery?.addEventListener("change", (event) => {
    if (event.matches) {
      closeMobileShopFeature();
      shopFeature?.setAttribute("aria-hidden", "true");
      return;
    }

    shopFeature?.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-shop-overlay-open");
  });
}
