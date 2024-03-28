if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

var cartItemsSaved = [];
function ready() {
  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    button.addEventListener("click", addToCartClicked);
  }

  document
    .getElementsByClassName("btn-purchase")[0]
    .addEventListener("click", purchaseClicked);
}

function purchaseClicked() {
  // Save the cart items to the array
  var cartItems = document.getElementsByClassName("cart-row");
  for (var i = 0; i < cartItems.length; i++) {
    var cartItem = cartItems[i];
    var itemImageElement = cartItem.querySelector(".cart-item-image");
    var itemTitleElement = cartItem.querySelector(".cart-item-title");
    var itemPriceElement = cartItem.querySelector(".cart-price");
    var itemQuantityElement = cartItem.querySelector(".cart-quantity-input");

    // Check if all required elements exist
    if (
      itemImageElement &&
      itemTitleElement &&
      itemPriceElement &&
      itemQuantityElement
    ) {
      var itemImage = itemImageElement.src;
      var itemTitle = itemTitleElement.innerText;
      var itemPrice = itemPriceElement.innerText;
      var itemQuantity = itemQuantityElement.value;

      cartItemsSaved.push({
        image: itemImage,
        title: itemTitle,
        price: itemPrice,
        quantity: itemQuantity,
      });
    } else {
      console.error("Required elements not found in cartItem:", cartItem);
    }
  }

  // Clear the cart
  while (cartItems.length > 0) {
    cartItems[0].remove();
  }

  // Update the cart total
  updateCartTotal();

  // Show the purchase confirmation
  alert("Thank you for your purchase!");

  // POST request to the server
  (async function () {
    try {
      const url = "http://localhost:3005/user-api/createcart"; // Replace this with your server's API endpoint
      const timeout = (ms) =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), ms)
        );

      const fetchpro = fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          cartItemsSaved: cartItemsSaved,
        }),
      });

      const res = await Promise.race([fetchpro, timeout(TIMEOUT_SEC)]);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(`${data.message}`);
      }
      console.log(data);
      return data;
    } catch (Error) {
      console.error("Error in the POST request:", Error);
      throw Error;
    }
  })();
}
function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  updateCartTotal();
}

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  var button = event.target;
  var shopItem = button.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  addItemToCart(title, price, imageSrc);
  updateCartTotal();
}

function addItemToCart(title, price, imageSrc) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }
  var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var price = parseFloat(priceElement.innerText.replace("$", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}
