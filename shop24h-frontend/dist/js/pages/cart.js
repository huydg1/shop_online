"use strict";
// Link API
const gPRODUCTS_URL = 'http://localhost:8080/api/products/';
const gUSERS_URL = 'http://localhost:8080/api/users/';
const gORDERS_URL = 'http://localhost:8080/api/orders/';
const gORDER_DETAILS_URL = 'http://localhost:8080/api/order-details/';

// template cart
const gCartTemplate = (product, productInfo) => {
  return `
  <div class="card-body">
    <div class="row">
      <div class="col-md-3">
        <img class="img-thumbnail"
          src="../${productInfo.imageUrl}">
      </div>
      <div class="col-md-9">

        <div class="row">
          <div class="col-md-8">
            <label id="lbl-product-name" class="font-weight-bold">${productInfo.productName} &nbsp; ${productInfo.materialName}</label>
          </div>
          <div class="col-md-4 text-right link-hover">
            <small data-product-id="${product.productId}" class="btn-delete-cart">Xóa</small>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <small id="lbl-product-name">${productInfo.colorName}</small>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="btn-group">
              <button data-product-id="${product.productId}" class="btn btn-outline-secondary size-input-cart rounded-0 btn-minus"
                onclick="this.parentNode.querySelector('input[type=number]').stepDown()">-</button>
              <input id="inp-quantity" class="form-control text-center rounded-0 size-input-cart" min="1"
                name="quantity" value="${product.quantityOrder}" type="number" readonly>
              <button data-product-id="${product.productId}" class ="btn btn-outline-secondary size-input-cart rounded-0 btn-plus"
              onclick="this.parentNode.querySelector('input[type=number]').stepUp()">+</button>
            </div>
          </div>
          <div class="col-md-6 text-right">
            <label id="lbl-price">${(product.priceEach * product.quantityOrder).toLocaleString()}đ</label>
          </div>
        </div>

      </div>
    </div>
  </div>`
};

// template cart field
const gCartFieldTemplate = `
  <div class="row p-5">
    <div class="col-md-12 text-center">
      <h5>Chưa có sản phẩm</h5>
    </div>
  </div>
`
// Biến toàn cục
// const gCART = 'CART';
const gUSER_NOT_EXISTS = 0;
var gUserId = 0;
var gOrderCode = '';

// Nơi xử lý sự kiện khi trang web đã được load giao diện
$(document).ready(function () {

  // load username khi đã đăng nhập
  var vUser = getUser();
  if (vUser.fullName !== '') {
      $('#a-user-name').html('Xin chào! ' + vUser.fullName);
  }

  // get info user (nếu đăng nhập)
  gUserId = vUser.id;
  getUserInfoById(gUserId);

  // get cart
  var vCart = getCart();

  // show or hide button 'Đặt hàng'
  showHideButton(vCart);

  // load cart
  buildCart(vCart);

  // event click button 'xóa' cart
  $('#product-cart').on('click', '.btn-delete-cart', function () {
    var vProductId = $(this).data('product-id');
    // console.log(vProductId);
    removeCart(vProductId);
  })

  // event click button '+' plus quantity
  $('#product-cart').on('click', '.btn-plus', function () {
    var vProductId = $(this).data('product-id');
    console.log(vProductId);
    plusQuantityCart(vProductId);
  })

  // event click button '-' minus quantity
  $('#product-cart').on('click', '.btn-minus', function () {
    var vProductId = $(this).data('product-id');
    console.log(vProductId);
    minusQuantityCart(vProductId);
  })

  // event click button 'Đặt hàng' order
  $('#btn-order').on('click', onBtnOrderClick);

  // event click button 'Áp dụng' check voucher
  $('#btn-ap-dung').on('click', onBtnApDungClick);

});

// show name từ localStorage hiển thị trên menu (nếu đăng nhập thành công)
function getUser() {
  "use strict";
  var vUser = localStorage.getItem('USER_NAME');
  // console.log(JSON.parse(vUser));
  return JSON.parse(vUser);
}

/**
 * Hàm lấy user khi người dùng id
 * @param {*} pUserId người dùng nhập
 * output: user
 */
function getUserInfoById(pUserId) {
  "use strict";
  // gọi API lấy data từ server
  $.ajax({
    url: gUSERS_URL + 'info/id/' + pUserId,
    type: "GET",
    dataType: 'json',
    async: false,
    success: function (responseObject) {
      mapDataInfo(responseObject);
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
}

/**
 * Map data info vào các trường input
 * @param {*} pUser dữ liệu cần map
 */
function mapDataInfo(pUser) {
  "use strict";
  $('#inp-full-name').val(pUser.fullName);
  $('#inp-phone').val(pUser.phone);
  $('#inp-email').val(pUser.email);
  $('#inp-address').val(pUser.address);
}

/**
 * Hàm get list cart
 * @returns Object list cart in localstarage
 */
function getCart() {
  "use strict";
  var vResult = localStorage.getItem(gCART);
  // console.log('List cart: ', JSON.parse(vResult));
  return JSON.parse(vResult);
}

/**
 * Hàm show or hide button 'Đặt hàng'
 * @param {*} pCart is list cart
 * Output: if cart.length = 0, hide button 'Đặt hàng',
 * else show button 'Đặt hàng'
 */
function showHideButton(pCart) {
  "use strict";
  if (pCart.items.length !== 0) {
    $('#btn-order').prop('disabled', false);
  } else {
    $('#btn-order').prop('disabled', true);
  }
}

/**
 * Hàm khởi tạo giao diện danh sách đơn hàng trong giỏ hàng
 * @param {*} pProducts là đối tượng chứa danh sách giỏ hàng lấy từ localStorage
 * Output: load giao diện chứa danh sách giỏ hàng
 */
function buildCart(pProducts) {
  "use strict";
  if (pProducts.items.length !== 0) {
    pProducts.items.forEach(product => {
      var vProductInfo = getProductInfo(product.productId);
      const vProduct = gCartTemplate(product, vProductInfo);
      $('#product-cart').append(vProduct);
    });
  } else {
    $('#product-cart').append(gCartFieldTemplate);
  }
  builTotal(pProducts);
}

/**
 * Hàm lấy dữ liệu chi tiết 1 product từ API
 * @param {*} pProductId là id lấy từ list cart
 * Output: lấy được info product từ server trả về
 */
function getProductInfo(pProductId) {
  "use strict";
  // gọi API lấy data từ server
  var vProductInfo = '';
  $.ajax({
    url: gPRODUCTS_URL + pProductId,
    type: "GET",
    dataType: 'json',
    async: false,
    success: function (responseObject) {
      vProductInfo = responseObject;
      // console.log(vProductInfo);
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
  return vProductInfo;
}

/**
 * Hàm load title tính tổng tiền trong danh sách giỏ hàng, 
 * khi thực hiện build cart
 * @param {*} pProducts danh sách sản phẩm trong giỏ hàng
 * Output: update title tổng tiền
 */
function builTotal(pProducts) {
  "use strict";
  // buil provisional
  var vProvisional = 0;
  pProducts.items.forEach(product => {
    var vIntoMoney = product.quantityOrder * product.priceEach;
    vProvisional += vIntoMoney;
  });

  $('#lbl-provisional-amount').html(vProvisional.toLocaleString() + 'đ');
  if (pProducts.items.length > 0) {
    $('#lbl-price-shipped').html('25000');
  }
  // buil total
  total();
}

/**
 * Hàm tính tổng cộng đơn hàng tự động khi đã cộng thêm các giá tiền khác
 * Output: show giá tiền lable
 */
function total() {
  "use strict";
  var vDiscount = parseInt($('#lbl-discount').html().replace(/[^\d.-]/g, ''), 10);
  var vPriceShipped = parseInt($('#lbl-price-shipped').html().replace(/[^\d.-]/g, ''), 10);
  var vProvisional = parseInt($('#lbl-provisional-amount').html().replace(/[^\d.-]/g, ''), 10);
  var vTotal = vDiscount + vPriceShipped + vProvisional;
  $('#lbl-total-amount').html(vTotal.toLocaleString() + 'đ');
}

/**
 * Hàm remove 1 item in cart
 * @param {*} pProductId là id sản phẩm lấy được khi ấn nút 'xóa'
 * Output: remove item in cart
 */
function removeCart(pProductId) {
  "use strict";
  let vProductData = [];
  vProductData = getCart();
  var vCheck = false;
  let bI = 0;
  while (!vCheck && bI < vProductData.items.length) {
    if (vProductData.items[bI].productId === pProductId) {
      vCheck = true;
    } else {
      bI++;
    }
  }
  if (vCheck) {
    vProductData.items.splice(bI, 1);
  }
  localStorage.setItem(gCART, JSON.stringify(vProductData));
  window.location.reload();
}

/**
 * Hàm thêm số lượng sản phẩm đang chọn
 * @param {*} pProductId là id sản phẩm lấy được khi ấn nút '+'
 * Output: update số lượng sản phẩm được chọn trong giỏ hàng
 */
function plusQuantityCart(pProductId) {
  "use strict";
  let vProductData = [];
  vProductData = getCart();
  var vCheck = false;
  let bI = 0;
  while (!vCheck && bI < vProductData.items.length) {
    if (vProductData.items[bI].productId === pProductId) {
      vCheck = true;
    } else {
      bI++;
    }
  }
  if (vCheck) {
    vProductData.items[bI].quantityOrder++;
  }
  localStorage.setItem(gCART, JSON.stringify(vProductData));
  window.location.reload();
}

/**
 * Hàm giảm số lượng sản phẩm đang chọn
 * @param {*} pProductId là id sản phẩm lấy được khi ấn nút '-'
 * Output: update số lượng sản phẩm được chọn trong giỏ hàng
 */
function minusQuantityCart(pProductId) {
  "use strict";
  let vProductData = [];
  vProductData = getCart();
  var vCheck = false;
  let bI = 0;
  while (!vCheck && bI < vProductData.items.length) {
    if (vProductData.items[bI].productId === pProductId && vProductData.items[bI].quantityOrder > 1) {
      vCheck = true;
    } else {
      bI++;
    }
  }
  if (vCheck) {
    vProductData.items[bI].quantityOrder--;
  }
  localStorage.setItem(gCART, JSON.stringify(vProductData));
  window.location.reload();
}

/**
 * Hàm xử lý khi click button 'Đặt hàng'
 * Thứ tự ghi data vào database
 * 1. Tạo hoặc cập nhật user, return userId
 * 2. Tạo đơn hàng, return orderId
 * 3. Tạo chi tiết đơn hàng, insert order detail
 * Input: read data khách hàng, giỏ hàng, xử lý API
 * Output: đặt hàng thành công
 */
function onBtnOrderClick() {
  "use strict";
  // Khai bao Object User
  var vObjectUser = {
    fullName: '',
    phone: '',
    email: '',
    address: ''
  }

  // Khai báo Object Order
  var vObjectOrder = {
    voucherCode: '',
    discount: 0.0,
    priceShipped: 0.0,
    note: '',
    status: 1
  }
  // read data user
  readUser(vObjectUser);
  // read data order
  readOrder(vObjectOrder);
  // validate user
  if (validate(vObjectUser)) {
    // Khai báo biến hứng userId và orderId trả về
    var vUserId = 0;
    var vOrderId = 0;

    // Kiểm tra nếu khách hàng chưa đăng nhập
    if (gUserId === gUSER_NOT_EXISTS) {
      // Hàm lấy userId khi khách hàng nhập số điện thoại
      vUserId = getUserIdByPhone(vObjectUser.phone);
      // Kiểm tra số điện thoại
      if (vUserId === gUSER_NOT_EXISTS) {
        vUserId = createUser(vObjectUser);
      } else {
        updateUser(vObjectUser, vUserId);
      }
    } else {
      // khách hàng đã đăng nhập
      vUserId = gUserId;
      updateUser(vObjectUser, vUserId);
    }

    // Tạo order với userId vừa được trả về
    vOrderId = createOrder(vObjectOrder, vUserId);
    // Lấy danh sách sản phẩm trong giỏ hàng
    var vProductInCart = getCart();
    // Đếm số lượng sản phẩm trong giỏ hàng
    var vLengthCart = vProductInCart.items.length;
    // Duyệt từng sản phẩm lưu vào database, 
    // Đồng thời xóa từng sản phẩm trong giỏ hàng ở localStorage
    while (vLengthCart >= 1) {
      var bItemProduct = vProductInCart.items[vLengthCart - 1];
      // Tạo chi tiết order
      createOrderDetail(bItemProduct, vOrderId, bItemProduct.productId);
      // Xóa item trong giỏ hàng
      vProductInCart.items.splice(vLengthCart - 1, 1);
      vLengthCart--;
    }
    // set giỏ hàng đã xóa = null lên localStorage
    localStorage.setItem(gCART, JSON.stringify(vProductInCart));
    // Chuyển đến page thông báo đặt hàng thành công
    openPageOrderSuccess(gOrderCode);
  }
}

/**
 * Hàm thu thập dữ liệu khách hàng
 * @param {*} pUser là Object để hứng dữ liệu nhập
 * @returns pUser đã có dữ liệu
 */
function readUser(pUser) {
  "use strict";
  pUser.fullName = $.trim($('#inp-full-name').val());
  pUser.phone = $.trim($('#inp-phone').val());
  pUser.email = $.trim($('#inp-email').val());
  pUser.address = $.trim($('#inp-address').val());
  return pUser;
}

/**
 *  Hàm thu thập dữ liệu order
 * @param {*} pOrder là Object để hứng dữ liệu nhập
 * @returns pOrder đã có dữ liệu
 */
function readOrder(pOrder) {
  "use strict";
  pOrder.voucherCode = $.trim($('#inp-voucher-code').val());
  pOrder.discount = parseFloat($.trim($('#lbl-discount').html()));
  pOrder.priceShipped = parseFloat($.trim($('#lbl-price-shipped').html()));
  pOrder.note = $.trim($('#inp-note').val());
  return pOrder;
}

/**
 * Hàm kiểm tra dữ liệu nhập
 * @param {*} pUser Object chứa dữ liệu cần kiểm tra
 * @returns true nếu dữ liệu hợp lệ,
 * ngược lại return false
 */
function validate(pUser) {
  "use strict";
  var vMess = '';
  if (!pUser.fullName) {
    vMess = 'Bạn chưa nhập họ tên';
    console.assert(false, '100: ', vMess);
    toastr.error(vMess);
    $('#inp-full-name').focus();
    return false;
  }
  if (!pUser.phone) {
    vMess = 'Bạn chưa nhập số điện thoại';
    console.assert(false, '200: ', vMess);
    toastr.error(vMess);
    $('#inp-phone').focus();
    return false;
  }
  if (!pUser.email) {
    vMess = 'Bạn chưa nhập email';
    console.assert(false, '300: ', vMess);
    toastr.error(vMess);
    $('#inp-email').focus();
    return false;
  } else if (!isEmail(pUser.email)) {
    vMess = 'Email không đúng định dạng';
    console.assert(false, '310: ', vMess);
    toastr.error(vMess);
    $('#inp-email').focus();
    return false;
  } else if (isExistsPhoneAndEmail(pUser.phone, pUser.email)) {
    vMess = 'Email ' + pUser.email + ' already exists';
    console.assert(false, '320: ' + vMess);
    toastr.error(vMess);
    $('#inp-email').focus();
    return false;
  }
  if (!pUser.address) {
    vMess = 'Bạn chưa nhập địa chỉ';
    console.assert(false, '400: ', vMess);
    toastr.error(vMess);
    $('#inp-address').focus();
    return false;
  }
  return true
}

/**
 * Hàm kiểm tra format email
 * @param {*} pEmail là dữ liệu người dùng nhập
 * @returns true nếu hợp lệ, ngược lại return false
 */
function isEmail(pEmail) {
  var vEmailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return vEmailReg.test(pEmail);
}

/**
 * Hàm kiểm tra phone và email có tồn tại hay chưa
 * kiểm tra từ API server
 * @param {*} pPhone dữ liệu người dùng nhập
 * @param {*} pEmail dữ liệu người dùng nhập
 * @returns true nếu phone và email đã tồn tại
 * ngược lại return phone
 */
function isExistsPhoneAndEmail(pPhone, pEmail) {
  "use strict";
  var vExists = false;
  var vUrl = gUSERS_URL + 'exists/phone-email/' + pPhone + '/' + pEmail;
  $.ajax({
    url: vUrl,
    type: "GET",
    dataType: 'json',
    async: false,
    success: function (responseObject) {
      vExists = responseObject.exists;
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
  return vExists;
}

/**
 * Hàm lấy mã userId khi người dùng nhập số phone
 * @param {*} pPhone người dùng nhập
 * @returns 0 nếu user không tồn tại,
 * ngược lại return false
 */
function getUserIdByPhone(pPhone) {
  "use strict";
  // gọi API lấy data từ server
  var vUserId = 0;
  $.ajax({
    url: gUSERS_URL + 'info/phone/' + pPhone,
    type: "GET",
    dataType: 'json',
    async: false,
    success: function (responseObject) {
      vUserId = responseObject.id;
      // console.log('vUserId: ', vUserId);
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
  return vUserId;
}

/**
 * Hàm tạo một user mới
 * @param {*} pUser là Object chứa info user
 * @returns vUserId vừa tạo do server trả về
 */
function createUser(pUser) {
  "use strict";
  var vUserId = 0;
  $.ajax({
    url: gUSERS_URL,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(pUser),
    async: false,
    success: function (responseObject) {
      // console.log('create user: ', responseObject);
      vUserId = responseObject.id;
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
  return vUserId;
}

/**
 * Hàm update info user
 * @param {*} pUser chứa info user
 * @param {*} pUserId là id server trả về khi kiểm tra phone hợp lệ
 * output: update user thành công
 */
function updateUser(pUser, pUserId) {
  "use strict";
  $.ajax({
    url: gUSERS_URL + pUserId,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(pUser),
    success: function (responseObject) {
      // console.log('update: ', responseObject);
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
}

/**
 * Hàm tạo 1 order
 * @param {*} pOrder là Object chứa info order 
 * @param {*} pUserId là server trả về khi đã tạo hoặc update user trước đó
 * @returns vOrderId để dùng mã này thêm vào chi tiết đơn hàng
 */
function createOrder(pOrder, pUserId) {
  "use strict";
  var vOrderId = 0;
  $.ajax({
    url: gORDERS_URL + pUserId + '/' + pOrder.status,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(pOrder),
    async: false,
    success: function (responseObject) {
      vOrderId = responseObject.id;
      gOrderCode = responseObject.orderCode;
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
  return vOrderId;
}

/**
 * Hàm tạo chi tiết đơn hàng
 * @param {*} pOrderDetails là danh sách các sản phẩm trong giỏ hàng
 * bao gồm (số lượng, đơn giá)
 * @param {*} pOrderId là server trả về khi đã tạo order trước đó
 * @param {*} pProductId là id sản phẩm trong danh sách giỏ hàng
 * Output: thêm đơn hàng vào database thành công
 */
function createOrderDetail(pOrderDetails, pOrderId, pProductId) {
  "use strict";
  $.ajax({
    url: gORDER_DETAILS_URL + pOrderId + '/' + pProductId,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(pOrderDetails),
    async: false,
    success: function (responseObject) {
    },
    error: function (error) {
      console.assert(error.responseText);
    }
  });
}

/**
 * Hàm xử lý link đến trang order-success.html khi đặt hàng thành công
 * @param {*} pOrderCode là id đã đặt thành công
 * Output: chuyển đến page thông báo đặt hàng thành công
 */
function openPageOrderSuccess(pOrderCode) {
  "use strict";
  const vProductFormUrl = '../pages/order-success.html';
  var vUrlSiteToOpen = vProductFormUrl + '?orderCode=' + pOrderCode;
  window.location.href = vUrlSiteToOpen;
}

/**
 * Hàm click button check voucher
 * Input: read data, validate, process API
 * Output: show discount lable
 */
function onBtnApDungClick() {
  "use strict";

}

