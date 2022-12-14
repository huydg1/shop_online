"use strict";
// Link API
const gPRODUCTS_URL = 'http://localhost:8080/api/products/';
const gRATES_URL = 'http://localhost:8080/api/rates/product/';
const gREPLY_RATES_URL = 'http://localhost:8080/api/reply-rates?rateId=';

// Create template image product
const gImageFristLargeTemplate = (product) => {
    return `
    <div class="active carousel-item" data-slide-number="${product.id}">
        <img src="../${product.url}" class="img-fluids">
    </div>
    `
};

const gImageLargeTemplate = (product) => {
    return `
    <div class="carousel-item" data-slide-number="${product.id}">
        <img src="../${product.url}" class="img-fluids">
    </div>
    `
};

const gImageFirstSmallTemplate = (product) => {
    return `
    <li class=" active list-inline-item">
        <a id="carousel-selector-${product.id}" class="selected" data-slide-to="${product.id}" data-target="#myCarousel">
            <img src="../${product.url}" class="img-thumbnails">
        </a>
    </li>
    `
};

const gImageSmallTemplate = (product) => {
    return `
    <li class="list-inline-item">
        <a id="carousel-selector-${product.id}" data-slide-to="${product.id}" data-target="#myCarousel">
            <img src="../${product.url}" class="img-thumbnails">
        </a>
    </li>
    `
};

// template review
const gReviewTemplate = (rate) => {
    return `
    <div id="heading${rate.id}" class="card row form-group bg-light rounded cursor-pointer view-reply"
            data-rate-id = "${rate.id}" 
            data-toggle="collapse" 
            data-target="#collapse${rate.id}" 
            aria-expanded="false"
            aria-controls="collapse${rate.id}">
        <div class="col-sm-12 p-3">
            <div class="row">
                <div class="col-sm-1 text-right text-secondary p-2">
                    <i class="fas fa-user-circle fa-2x"></i>
                </div>
                <div class="col-sm-11">
                    <span id="sp-fullname">${rate.fullName}</span> &nbsp;-&nbsp;
                    <span id="sp-date-comment">${rate.commentDate}</span>
                    <p id="p-rate">${rate.rate}&nbsp;<i class="fas fa-star text-warning"></i></p>
                </div>
               
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <span id="sp-comment">${rate.comment}</span>
                </div>
            </div>
        </div>
    </div>

    <div id="collapse${rate.id}" class="collapse" aria-labelledby="heading${rate.id}"
        data-parent="#div-review">
    </div>`
}

// template reply review
const gReplyReviewTemplate = (replyRate) => {
    return `
    <div class="row form-group">
        <div class="col-sm-1"></div>
        <div class=" card col-sm-11 p-3 bg-light rounded">
            <div class="row">
                <div class="col-sm-1 text-right text-secondary p-2">
                    <i class="fas fa-user-circle fa-2x"></i>
                </div>
                <div class="col-sm-11">
                    <span id="sp-fullname">${replyRate.fullName}</span>
                    <p id="sp-date-comment">${replyRate.reCommentDate}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <span id="sp-comment">${replyRate.reCommnent}</span>
                </div>
            </div>
        </div>
    </div>`
}

// create template previous paging
const gPreviousTemplate = `
    <li class="page-item">
        <button class="page-link previous-page" aria-label="Previous">
            <span aria-hidden="true">Trang tr?????c</span>
            <span class="sr-only">Previous</span>
        </button>
    </li>`

// create template next paging
const gNextTemplate = `
    <li class="page-item">
        <button class="page-link next-page" aria-label="Next">
            <span aria-hidden="true">Trang sau</span>
            <span class="sr-only">Next</span>
        </button>
    </li>`

// create template current paging
const gPagingTemplate = (page) => {
    return `
    <li class="page-item">
    <input class="page-link current-page" value ="${page + 1}" type="button"></li>`
}

// Bi???n h???ng
const gZERO = 0;
// const gCART = 'CART';
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';

// Bi???n to??n c???c
var gProductId = 0;
var gProductObject = {};
var gTotalPages = 0;
var gTotalElements = 0;

$(document).ready(function () {

    // load username khi ???? ????ng nh???p
    var vUser = getUser();
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin ch??o! ' + vUser.fullName);
    }

    // get query string
    queryString();

    // get data product detail
    getProductDetail(gProductId);

    // get avg rate 
    getAvgRatesByProductId(gProductId);

    // get rates of product
    getRatesByProductId(gPAGE_FIRST, gProductId);

    // Show t???ng s??? ????nh gi??
    showCountRate();

    // show paging ????nh gi??
    buildPaging();

    // set currentpage l??n localStorage
    setCurrentPage(gPAGE_FIRST);

    // event click current page
    $('#ul-paging').on('click', '.current-page', function () {
        onCurrentPageClick(this);
    });

    // event click previous page
    $('#ul-paging').on('click', '.previous-page', function () {
        onPreviousPageClick(this);
    });

    // event click next page
    $('#ul-paging').on('click', '.next-page', function () {
        onNextPageClick(this);
    });

    // xem reply rate
    $('#div-review').on('click', '.view-reply', function () {
        getReplyRatesByRateId(this);
    });

    // event click button add cart
    $('#btn-add-cart').on('click', onBtnAddCartClick);

});

/**
 * H??m show fullName t??? localStorage hi???n th??? tr??n menu 
 * (n???u ????ng nh???p th??nh c??ng)
 * @returns 
 */
function getUser() {
    "use strict";
    var vUser = localStorage.getItem('USER_NAME');
    return JSON.parse(vUser);
}

/**
  * H??m l???y d??? li???u t??? query string
  * Input: ch??a c?? d??? li???u
  * Output: l???y ???????c d??? li???u t??? query string l??u v??o bi???n global
  */
function queryString() {
    "use strict";
    var vUrlString = window.location.href;
    var vUrl = new URL(vUrlString);
    gProductId = vUrl.searchParams.get('id');
}

/**
 * H??m l???y d??? li???u chi ti???t product
 * @param {*} pProductId id truy???n v??o l???y t??? query string
 * Output: l???y ???????c info product t??? server tr??? v???
 */
function getProductDetail(pProductId) {
    "use strict";
    // g???i API l???y data t??? server
    $.ajax({
        url: gPRODUCTS_URL + pProductId,
        type: "GET",
        dataType: 'json',
        success: function (responseObject) {
            gProductObject = responseObject;
            buildProducDetail(gProductObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * H??m map data v??o giao di???n
 * @param {*} pProduct d??? li???u c???n map
 * Output: giao di???n ???????c load d??? li???u
 */
function buildProducDetail(pProduct) {
    "use strict";
    $('#lbl-product-name').html(pProduct.productName);
    $('#lbl-material-name').html(pProduct.materialName);
    $('#lbl-discountPrice').html(pProduct.priceDiscount.toLocaleString() + '??');
    $('#lbl-price').html(pProduct.price.toLocaleString() + '??');
    $('#lbl-color').html(pProduct.colorName);
    $('#p-description').html(pProduct.description);
    buildImageLarge(pProduct.images);
    buildImageSmall(pProduct.images);
}

/**
 * H??m x??y d???ng template khi c?? d??? li???u truy???n v??o
 * @param {*} pProduct d??? li???u l???y t??? server
 * Output: show giao di???n c?? d??? li???u
 */
function buildImageLarge(pProduct) {
    "use strict";
    const vProduct = gImageFristLargeTemplate(pProduct[0]);
    $('#image-large').append(vProduct);
    for (let bIndex = 1; bIndex < pProduct.length; bIndex++) {
        const vElement = pProduct[bIndex];
        const vProduct = gImageLargeTemplate(vElement);
        $('#image-large').append(vProduct);
    }
}

/**
 * H??m x??y d???ng template khi c?? d??? li???u truy???n v??o
 * @param {*} pProduct d??? li???u l???y t??? server
 * Output: show giao di???n c?? d??? li???u
 */
function buildImageSmall(pProduct) {
    "use strict";
    const vProduct = gImageFirstSmallTemplate(pProduct[0]);
    $('#image-small').append(vProduct);
    for (let bIndex = 1; bIndex < pProduct.length; bIndex++) {
        const vElement = pProduct[bIndex];
        const vProduct = gImageSmallTemplate(vElement);
        $('#image-small').append(vProduct);
    }
}

/**
 * H??m t??nh ??i???m trung b??nh c??c ????nh gi?? c???a m???t s???n ph???m
 * @param {*} pProductId s???n ph???m ???????c ??anh gi??
 */
function getAvgRatesByProductId(pProductId) {
    "use strict"
    // g???i API l???y data t??? server
    var vUrl = gRATES_URL + 'avg/' + pProductId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        success: function (responseObject) {
            // show ??i???m ????nh gi??
            $('#lbl-avg-rate').html(responseObject + '/' + 5);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * H??m l???y danh s??ch ????nh gi?? c???a 1 s???n ph???m
 * @param {*} pCurrentPage s??? trang hi???n t???i
 * @param {*} pProductId s???n ph???m ???????c ch???n
 * output: show ????nh gi?? n???u c??
 */
function getRatesByProductId(pCurrentPage, pProductId) {
    "use strict"
    // g???i API l???y data t??? server
    var vUrl = gRATES_URL + pProductId + '?page=' + pCurrentPage;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (res) {
            // console.log(res);
            // T???ng s??? trang hi???n th??? ????nh gi??
            gTotalPages = res.totalPages;
            // T???ng s??? d??ng c??c ????nh gi??
            gTotalElements = res.totalElements;
            // load giao di???n c??c ????nh gi??
            buildRates(res.content);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * H??m v??? giao di???n c??c ????nh gi??
 * @param {*} pRates data c???n ????? v??o giao di???n
 */
function buildRates(pRates) {
    "use strict";
    $('#div-review').empty();
    pRates.forEach(rate => {
        const vRate = gReviewTemplate(rate);
        $('#div-review').append(vRate);
    });
}

/**
 * H??m l???y danh s??ch tr??? l???i ????nh gi?? c???a m???t s???n ph???m
 * @param {*} pThis ?????i t?????ng c???n truy v???n
 */
function getReplyRatesByRateId(pThis) {
    "use strict"
    var vRateId = $(pThis).data('rate-id');
    // g???i API l???y data t??? server
    var vUrl = gREPLY_RATES_URL + vRateId;
    // console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (responseObject) {
            buildReplyRates(vRateId, responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * H??m v??? giao di???n c??c tr??? l???i????nh gi??
 * @param {*} pRateId id ???????c truy v???n
 * @param {*} pReplyRates danh s??ch n???i dung tr??? l???i
 */
function buildReplyRates(pRateId, pReplyRates) {
    "use strict";
    $('#collapse' + pRateId).empty();
    pReplyRates.forEach(replyRate => {
        const vReplyRate = gReplyReviewTemplate(replyRate);
        $('#collapse' + pRateId).append(vReplyRate);
    });
}

// H??m show t???ng s??? l?????ng c??c ????nh gi?? c???a s???n ph???m hi???n t???i
function showCountRate() {
    "use strict";
    if (gTotalElements === gZERO) {
        $('#a-count-rate')
            .html('(Ch??a c?? ????nh gi??)')
            .prop('disabled', true);
    } else {
        $('#a-count-rate')
            .html('(Xem ' + gTotalElements + ' ????nh gi??)')
            .prop('disabled', false);
    }
}

/**
 * H??m v??? paging khi c?? TotalPages
 * Input: ch??a ph??n trang
 * Output: v??? ???????c paging ???? ph??n trang theo TotalPages
 */
function buildPaging() {
    "use strict";
    $('#ul-paging').empty().append(gPreviousTemplate);
    for (let bIndex = 0; bIndex < gTotalPages; bIndex++) {
        const vPaging = gPagingTemplate(bIndex);
        $('#ul-paging').append(vPaging);
    }
    $('#ul-paging').append(gNextTemplate);
}

/**
 * H??m set page hi???n t???i khi load request m???i
 * @param {*} pCurrentPage page hi???n t???i
 * Output: load data new
 */
function setCurrentPage(pCurrentPage) {
    "use strict";
    var vPage = {
        currentPage: 0,
        size: 10,
        totalPages: 0
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPages;
    // set data localStorage
    localStorage.setItem(gPAGE_LOCAL_STORAGE, JSON.stringify(vPage));

    // x??? l?? show hide khi click number page
    var vPage = getPage();
    if (vPage.currentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vPage.currentPage == vPage.totalPages - 1 || vPage.totalPages === gPAGE_FIRST) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }
}

/**
 * H??m l???y currentPage v?? totalPages t??? localStorage
 * @returns vResult Object ch???a currentPage, size v?? totalPages
 */
function getPage() {
    // get Object from localStorage
    var vResult = localStorage.getItem(gPAGE_LOCAL_STORAGE);
    return JSON.parse(vResult);
}

/**
 * H??m x??? l?? khi click button paging
 * @param {*} pThis button page ???????c ch???n
 * output: set currentPage l??n localStorage
 * load danh s??ch m???i l???y t??? server theo page ???????c ch???n
 */
function onCurrentPageClick(pThis) {
    "use strict";
    // get currentPage ??ang ch???n
    var vCurrentPage = $(pThis).val() - 1;
    // get currentPage t??? localStorage
    var vPage = getPage();
    // Load rate
    getRatesByProductId(vCurrentPage, gProductId);
    // x??? l?? show hide khi click page
    if (vCurrentPage === gPAGE_FIRST) {
        $('#ul-paging').find('.previous-page').hide();
    } else {
        $('#ul-paging').find('.previous-page').show();
    }
    if (vCurrentPage == vPage.totalPages - 1) {
        $('#ul-paging').find('.next-page').hide();
    } else {
        $('#ul-paging').find('.next-page').show();
    }

    // set currentPage l??n localStorage 
    setCurrentPage(vCurrentPage);
}

/**
 * H??m x??? l?? khi click NextPage
 * @param {*} pThis page ??ang ch???n
 * output: n???u page current = trang cu???i, hide button next,
 */
function onPreviousPageClick(pThis) {
    "use strict";
    var vPage = getPage();
    if (vPage.currentPage > 0) {
        // Load rate
        getRatesByProductId(vPage.currentPage - 1, gProductId);
        // set currentPage l??n localStorage 
        setCurrentPage(vPage.currentPage - 1);
    }
}

/**
 * H??m x??? l?? khi click NextPage
 * @param {*} pThis page ??ang ch???n
 * output: n???u page current = trang cu???i, hide button next,
 */
function onNextPageClick(pThis) {
    "use strict";
    var vPage = getPage();
    // console.log('vCurrentPage: ', vPage.currentPage);
    if (vPage.currentPage < vPage.totalPages - 1) {
        // Load rate
        getRatesByProductId(vPage.currentPage + 1, gProductId);
        // set currentPage l??n localStorage 
        setCurrentPage(vPage.currentPage + 1);
    }
}

/**
 * H??m th??m s???n ph???m v??o gi??? h??ng
 * Input: gi??? h??ng ch??a c?? s???n ph???m
 * Output: gi??? h??ng c?? s???n ph???m
 */
function onBtnAddCartClick() {
    "use strict";
    // Khai b??o bi???n
    var vProduct = {
        productId: 0,
        quantityOrder: 0,
        priceEach: 0
    };
    // Read data
    readProduct(vProduct);
    // Process
    addCart(vProduct);
    // Show notification
    buildNotification();
    // Th??ng b??o
    toastr.success('S???n ph???m ???? th??m v??o gi??? h??ng');
}

/**
 * h??m thu th???p d??? li???u 1 s???n ph???m
 * @param {*} pProduct object ????? ch???a data
 * @returns pProduct ???? c?? data
 */
function readProduct(pProduct) {
    "use strict";
    pProduct.productId = parseInt(gProductId, 10);
    pProduct.quantityOrder = parseInt($('#inp-quantity-order').val(), 10);
    if (gProductObject.priceDiscount === gZERO) {
        pProduct.priceEach = gProductObject.price;

    } else {
        pProduct.priceEach = gProductObject.priceDiscount;
    }
    // console.log('read product: ', pProduct);
    return pProduct;
}

/**
 * H??m th??m m???i gi??? h??ng
 * @param {*} pProduct s???n ph???m ng?????i d??ng ch???n
 * output: add s???n ph???m ???????c v??o gi??? h??ng v?? l??u t???i localStorage
 */
function addCart(pProduct) {
    "use strict";
    // Khai b??o card
    var vCart = {
        items: []
    };
    // get cart
    var vGetCart = getCart();
    if (vGetCart === null) {
        // add cart
        vCart.items.push(pProduct);
        // console.log('Cart add: ', vCart);
    } else {
        // update cart
        vCart.items = updateCart(vGetCart, pProduct);
        // console.log('Cart update: ', vCart);
    }
    // set cart
    localStorage.setItem(gCART, JSON.stringify(vCart));
}

/**
 * H??m l???y gi?? tr??? ???????c l??u trong gi??? h??ng t??? localStorage
 * @returns l???y ???????c object ch???a list product
 */
function getCart() {
    var vResult = localStorage.getItem(gCART);
    // console.log('Cart: ', JSON.parse(vResult));
    return JSON.parse(vResult);
}

/**
 * H??m c???p nh???t cart
 * @param {*} pCart gi??? h??ng l???y t??? localStorage
 * @param {*} pProduct s???n ph???m ng?????i d??ng ch???n
 * @returns gi??? h??ng ???? th??m s???n ph???m
 */
function updateCart(pCart, pProduct) {
    "use strict";
    var vProducts = pCart.items;
    var vCheck = false;
    var bIndex = 0;
    while (!vCheck && bIndex < vProducts.length) {
        if (vProducts[bIndex].productId === pProduct.productId) {
            vCheck = true;
        } else {
            bIndex++;
        }
    }
    if (vCheck) {
        vProducts[bIndex].quantityOrder += pProduct.quantityOrder;
    } else {
        vProducts.push(pProduct);
    }
    return vProducts;
}