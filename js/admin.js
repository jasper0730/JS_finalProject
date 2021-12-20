const orderList = document.querySelector(".js_orderList");

// 初始化
function init() {
    getOrderList();
}
init()

// 取得訂單列表
let orderData;
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            authorization: token
        }
    })
        .then((response) => {
            orderData = response.data.orders;
            renderOrderList();
        })
        .catch((error) => {
            console.log(error.message)
        })
}

function renderOrderList() {
    // 組訂單列表字串
    let str = "";
    orderData.forEach((item) => {
        // 組產品字串
        let productStr = "";
        item.products.forEach((productItem) => {
            productStr += `<p>${productItem.title}X${productItem.quantity}</p>`
        })
        // 組日期字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;

        // 組訂單狀態字串
        let listState = ""
        if (item.paid == true) {
            listState = "已處理"
        } else if (item.paid == false) {
            listState = "未處理"
        }

        str += `<tr>
        <td>${item.id}</td>
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>${productStr}</td>
        <td>${orderTime}</td>
        <td class="orderStatus">
            <a href="#" class="orderStateBtn" data-state=${item.paid} data-id=${item.id}>${listState}</a>
        </td>
        <td>
            <input type="button" class="delSingleOrder-Btn orderDeleteBtn" data-id=${item.id} value="刪除">
        </td>
    </tr>`
    })
    orderList.innerHTML = str;
    renderC3Lv2()
}

// 修改狀態及刪除指定訂單
orderList.addEventListener("click", (e) => {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let state = e.target.getAttribute("data-state")
    let id = e.target.getAttribute("data-id")
    if (targetClass === "orderStateBtn") {
        orderListChangeState(state, id)
    } else if (targetClass === "delSingleOrder-Btn orderDeleteBtn") {
        orderListDelete(id)
    }
})
// 修改狀態
function orderListChangeState(state, id) {
    let newState;
    if (state === "true") {
        newState = false;
    } else {
        newState = true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newState
        }
    }, {
        headers: {
            authorization: token
        }
    })
        .then((response) => {
            alert("修改狀態成功")
            getOrderList();
        })
        .catch((error) => {
            console.log(error.message)
        })

}

// 刪除指定訂單
function orderListDelete(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}
    `, {
        headers: {
            authorization: token
        }
    })
        .then((response) => {
            alert("刪除成功")
            getOrderList();
        })
        .catch((error) => {
            console.log(error.message)
        })
}

// 清空購物車功能
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (orderData.length == 0) {
        return alert("請加入購物車")
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            authorization: token
        }
    })
        .then((response) => {
            alert("已清空購物車")
            getOrderList();
        })
        .catch((error) => {
            console.log(error.message)
        })
})


// C3.js 類別圖表
function renderC3() {
    //轉成C3要的資料格式
    //先把要用的類別及該類別的總金額篩選出來
    let totalObj = {};
    orderData.forEach((item) => {
        item.products.forEach((productItem) => {
            if (totalObj[productItem.category] == undefined) {
                totalObj[productItem.category] = productItem.price * productItem.quantity
            } else {
                totalObj[productItem.category] += productItem.price * productItem.quantity
            }
        })
    })
    let categoryAry = Object.keys(totalObj);
    let newData = [];
    categoryAry.forEach((item) => {
        let ary = [];
        ary.push(item);
        ary.push(totalObj[item])
        newData.push(ary)
    })
    console.log(newData)



    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors: {
                "床架": "#DACBFF",
                "窗簾": "#9D7FEA",
                "收納": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

// C3.js Lv2 品項圖表
function renderC3Lv2() {
    // 將圖表所需要的項目建立成物件
    let totalObj = {};
    orderData.forEach((item) => {
        item.products.forEach((productItem) => {
            if (totalObj[productItem.title] === undefined) {
                totalObj[productItem.title] = productItem.price * productItem.quantity
            } else {
                totalObj[productItem.title] += productItem.price * productItem.quantity
            }
        })
    })
    console.log(totalObj)
    // 將蒐集好的資料內的物件屬性轉換成陣列
    const ary = Object.keys(totalObj);
    console.log(ary)
    //將資料轉換成C3的陣列包陣列的格式
    let changeToC3Ary = [];
    ary.forEach((item) => {
        let newAry = [];
        newAry.push(item);
        newAry.push(totalObj[item]);
        changeToC3Ary.push(newAry);
    })
    // 將整理好的陣列包陣列內的金額由大到小排序
    changeToC3Ary.sort((a, b) => {
        return b[1] - a[1];
    })

    // 如果資料超過三筆以上,統整成其它
    let otherTotal = 0;
    if (changeToC3Ary.length > 3) {
        // 把三筆以上的金額加總為其他的總金額
        changeToC3Ary.forEach((item, index) => {
            if(index > 2){
                otherTotal += changeToC3Ary[index][1];
            }
        })
    }
    changeToC3Ary.splice(3, changeToC3Ary.length - 1);
    changeToC3Ary.push(["其他", otherTotal]);

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: changeToC3Ary,
        },
        color: {
            pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F']
        }
    });
}

