// 產品列表
let productData;
function getProducts() {
    axios
        .get(`${baseUrl}/api/livejs/v1/customer/${api_path}/products`)
        .then((res) => {
            productData = res.data.products;
            renderProduct(productData);
            getSelectItem(productData);
        })
        .catch((error) => {
            console.log(error.message);
        });
}
function renderProduct(productData) {
    const productWrap = document.querySelector(".productWrap");
    let str = "";
    productData.forEach((item) => {
        str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src=${item.images} alt="">
                <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${numberWithCommas(item.origin_price)}</del>
                <p class="nowPrice">NT$${numberWithCommas(item.price)}</p>
            </li>`;
    });
    productWrap.innerHTML = str;
    const addCardBtn = document.querySelectorAll(".addCardBtn");
    addCardBtn.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            addToCart(e.target.dataset.id);
        });
    });
}
getProducts();

// 購物車列表
const cartList = document.querySelector(".cartList");
let cartData;
function getCarts() {
    axios
        .get(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`)
        .then((res) => {
            cartData = res.data.carts;
            document.querySelector(".js_total").textContent = res.data.finalTotal;

            renderCart(cartData);
        })
        .catch((error) => {
            console.log(error.message);
        });
}
function renderCart(cartData) {
    let str = "";
    cartData.forEach((item) => {
        str += `<tr>
            <td>
              <div class="cardItem-title">
                <img src=${item.product.images} alt="">
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${numberWithCommas(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${numberWithCommas(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" data-id=${item.id}>
                clear
              </a>
            </td>
          </tr>`;
    });
    cartList.innerHTML = str;
}
getCarts();

// 加入購物車
function addToCart(id) {
    let numCheck = 1;
    cartData.forEach((item) => {
        if (item.product.id === id) {
            numCheck = item.quantity += 1;
        }
    });
    let data = {
        data: {
            productId: id,
            quantity: numCheck
        }
    };
    axios
        .post(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, data)
        .then((res) => {
            alert("加入成功");
            getCarts();
        })
        .catch((error) => {
            console.log(error.message);
        });
}

// 先驗證沒問題再送出
const form = document.querySelector(".orderInfo-form");
const inputs = document.querySelectorAll(
    "input[type=text],input[type=tel],input[type=email]"
);
const messages = document.querySelectorAll("p[data-message]");
let constraints = {
    姓名: {
        presence: {
            message: "必填"
        }
    },
    電話: {
        presence: {
            message: "必填"
        }
    },
    Email: {
        presence: {
            message: "必填"
        },
        email: {
            message: "格式錯誤"
        }
    },
    寄送地址: {
        presence: {
            message: "必填"
        }
    }
};
form.addEventListener("submit", verification, false);
function verification(e) {
    e.preventDefault();
    let errors = validate(form, constraints);
    if (errors) {
        messages.forEach((item) => {
            item.textContent = errors[item.dataset.message];
        });
    } else {
        addOrder();
    }
}

//送出訂單
function addOrder() {
    const name = document.querySelector("#customerName")
    const tel = document.querySelector("#customerPhone")
    const email = document.querySelector("#customerEmail")
    const address = document.querySelector("#customerAddress")
    const payment = document.querySelector("#tradeWay")
    let data = {
        data: {
            user: {
                "name": name.value,
                "tel": tel.value,
                "email": email.value,
                "address": address.value,
                "payment": payment.value
            }
        }
    };
    axios
        .post(`${baseUrl}/api/livejs/v1/customer/${api_path}/orders`, data)
        .then((res) => {
            getCarts();
            form.reset();
            alert("送出成功");
        })
        .catch((error) => {
            console.log(error.message);
        });
}

//每次換行就驗證
inputs.forEach((item) => {
    item.addEventListener("change", (e) => {
        e.preventDefault();
        let errors = validate(form, constraints);
        item.nextElementSibling.textContent = "";
        let targetName = e.target.name;
        if (errors) {
            document.querySelector(`[data-message=${targetName}]`).textContent =
                errors[targetName];
        }
    });
});

// 篩選列表
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
    let category = e.target.value;
    if (category === "全部") {
        renderProducts(productData);
        return;
    }
    let targetData = [];
    productData.forEach((item) => {
        if (item.category === category) {
            targetData.push(item);
        }
    });
    renderProduct(targetData);
});

// 篩選列表的品項
function getSelectItem(productData) {
    let unSort = productData.map((item) => {
        return item.category;
    });
    let sorted = unSort.filter((item, i) => {
        return unSort.indexOf(item) === i;
    });
    renderSelect(sorted);
}
function renderSelect(sorted) {
    let str = `<option value="全部" selected>全部</option>`;
    sorted.forEach((item) => {
        str += `<option value=${item}>${item}</option>`;
    });
    productSelect.innerHTML = str;
}

// 刪除單筆品項
cartList.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.target.nodeName !== "A") {
        return;
    }
    deleteSingleItem(e.target.dataset.id);
});
function deleteSingleItem(id) {
    axios
        .delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${id}`)
        .then((res) => {
            alert("刪除成功");
            getCarts();
        })
        .catch((error) => {
            console.log(error.message);
        });
}

// 清空購物車
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click", (e) => {
    e.preventDefault();
    axios
        .delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`)
        .then((res) => {
            alert("清空購物車");
            getCarts();
        })
        .catch((error) => {
            console.log(error.message);
        });
});

//千分位函式
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
