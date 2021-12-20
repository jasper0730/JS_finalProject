// DOM
const productWrap = document.querySelector(".productWrap")
const productSelect = document.querySelector(".productSelect")
const cartList = document.querySelector(".shoppingCarttableBody")
const cartFoot = document.querySelector(".shoppingCarttableFoot")

// 初始化
function init() {
    getProducts();
    getCartList()
}
init();
let products;
let cartData;
// 取得產品列表
function getProducts() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then((response) => {
            products = response.data.products;
            renderProducts()
        })
}
function renderProducts() {
    let str = "";
    products.forEach((item) => {
        str += priductCombineStr(item)
    })
    productWrap.innerHTML = str;
}

// 產品列表字串組合
function priductCombineStr(item) {
    return `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${numberWithCommas(item.origin_price)}</del>
        <p class="nowPrice">NT$${numberWithCommas(item.price)}</p>
    </li>`
}

// 取得購物車列表
function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            cartData = response.data.carts;
            document.querySelector(".js_total").textContent = numberWithCommas(response.data.finalTotal);
            renderCartList();
        })
        .catch((error) => {
            console.log(error.message);
        })
}

function renderCartList() {
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
        </tr>`
    })

    cartList.innerHTML = str;

}

// 篩選類別
productSelect.addEventListener("change", (e) => {
    const category = e.target.value;
    if (category == "全部") {
        renderProducts();
        return;
    }
    let str = "";
    products.forEach((item) => {
        if (item.category == category) {
            str += priductCombineStr(item);
        }
    })
    productWrap.innerHTML = str;
})

// 加入購物車邏輯
productWrap.addEventListener("click", (e) => {
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class")
    if (addCartClass !== "addCardBtn") {
        return;
    }
    let productId = e.target.getAttribute("data-id")

    let numCheck = 1;
    cartData.forEach((item) => {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1;
        }
    })

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    })
        .then((response) => {
            alert("加入購物車成功")
            getCartList()
        })
})

// 刪除購物車特定品項
cartList.addEventListener("click", (e) => {
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if (cartId === null) {
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then((response) => {
            alert("刪除成功")
            getCartList()
        })
        .catch((error) => {
            console.log(error.message)
        })


})

// 清空購物車功能
cartFoot.addEventListener("click", (e) => {
    e.preventDefault();
    const discardAllBtn = e.target.getAttribute("class")
    if (discardAllBtn !== "discardAllBtn") {
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            alert("購物車已清空")
            console.log(response.data)
            getCartList()
        })
        .catch((response) => {
            alert("購物車內目前沒有商品喔")
        })
})

// 送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn")

const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

orderInfoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (cartData.length == 0) {
        alert("購物車內無品項")
        return;
    }
    if (
        customerName.value == "" ||
        customerPhone.value == "" ||
        customerEmail.value == "" ||
        customerAddress.value == "" ||
        tradeWay.value == "") {
        alert("請輸入訂單資訊");
        return;
    }
    let data = {
        "data": {
            "user": {
                "name": customerName.value,
                "tel": customerPhone.value,
                "email": customerEmail.value,
                "address": customerAddress.value,
                "payment": tradeWay.value
            }
        }
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, data)
        .then((response) => {
            alert("送出成功");
            customerName.value = "";
            customerPhone.value = "";
            customerEmail.value = "";
            customerAddress.value = "";
            tradeWay.value = "ATM";
            getCartList();
        })
        .catch((error) => {
            console.log(error.message)
        })
})

// 千份位函式 
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// 驗證
const form = document.querySelector(".orderInfo-form")
console.log(form)
const inputs = document.querySelectorAll("input[name],select[data-payment]")
console.log(inputs)
const constraints = {
    "姓名":{
        presence:{
            message:"必填"
        }
    },
    "電話":{
        presence:{
            message:"必填"
        },
        length:{
            minimum:8,
            message:"需填入至少8碼"
        }
    },
    "Email":{
        presence:{
            message:"必填"
        },
        email:{
            message:"不符合email格式"
        }
    },
    "寄送地址":{
        presence:{
            message:"必填"
        }
    },
    "交易方式":{
        presence:{
            message:"必填"
        }
    }
}

inputs.forEach((item)=>{
    item.addEventListener("change",()=>{
        // input下面那行字預設為空值
        item.nextElementSibling.textContent = "";
        let errors = validate(form,constraints)
        console.log(errors)
        // 如果觸發回傳驗證,帶入
        if (errors) {
            Object.keys(errors).forEach(function (keys) {
              document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
            })
          }
    })
})