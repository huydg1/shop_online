"use strict";
// Link API
const gPRODUCTS_URL = 'http://localhost:8080/api/products/filter';

// Template item product
const gProductTemplate = (product) => {
    return `
    <div class="col-xs-12 col-sm-6 col-lg-4">
        <div class="item-box-blog-image">
            <!--Image-->
            <figure> <img class="btn-product-detail" data-product-id="${product.id}" src="${product.imageUrl}" >
            </figure>
        </div>
        <div class="item-box-blog-body text-center">
            <!--Heading-->
            <div class="item-box-blog-heading">
                <h5 class="text-primary">${product.productName}</h5>
                <label class="font-weight-bold">${product.materialName}</label>
            </div>
            <!--Data-->
            <div class="item-box-blog-data" style="padding: px 15px;">
                <label id="p-discountPrice" class="font-weight-bold">${product.priceDiscount.toLocaleString()}đ</label>
                <small id="sml-price" class="text-decoration-line-through text-secondary">${product.price.toLocaleString()}đ</small>
            </div>
        </div>
    </div>
    `
}

// Biến toàn cục
const gPAGE_FIRST = 0;
const gPAGE_LOCAL_STORAGE = 'PAGE';
var gTotalPages = 0;

// Nơi xử lý sự kiện khi trang web đã được load giao diện
$(document).ready(function () {

    onPageLoading();

    // event click image product link to page detail product
    $('#product-list').on('click', '.btn-product-detail', function () {
        openPageProductDetail(this);
    })

    // event click button read more
    $('#div-read-more').on('click', '.read-more', function () {
        onBtnReadMoreClick(this);
    });
});

/**
 * Hàm chạy khi trang web được load
 * Input: chưa có data
 * Output: có data 
 */
function onPageLoading() {
    "use strict";
    // load username khi đã đăng nhập
    var vUser = getUser();
    if (vUser.fullName !== '') {
        $('#a-user-name').html('Xin chào! ' + vUser.fullName);
    }

    // get list product
    getProducts(gPAGE_FIRST);
    // load paging
    buildPaging();
    // set curent page
    setCurrentPage(gPAGE_FIRST);
    // hide spinner when load page
    $('#div-spinner').hide();
}

/**
 * Hàm show fullName từ localStorage hiển thị trên menu 
 * (nếu đăng nhập thành công)
 * @returns 
 */
function getUser() {
    "use strict";
    var vUser = localStorage.getItem('USER_NAME');
    return JSON.parse(vUser);
}

/**
 * Hàm gọi API get data product
 * xử lý đổ dữ liệu product lên template
 * @param {*} pCurrentPage số trang hiện tại
 * Output: get được dữ liệu và đổ vào template
 */
function getProducts(pCurrentPage) {
    "use strict";
    var vUrl = gPRODUCTS_URL + '?page=' + pCurrentPage + '&productName=&category=0&priceMin=&priceMax=';
    console.log(vUrl);
    $.ajax({
        url: vUrl,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (res) {
            buildProducs(res.content);
            console.log(res);
            gTotalPages = res.totalPages;
        },
        error: function (error) {
            console.assert(error.responseText);
        }
    });
}

/**
 * Hàm load list product vào template item product
 *  khi có dữ liệu truyền vào
 * @param {*} pProducts dữ liệu server trả về
 * Output: show giao diện có dữ liệu
 */
function buildProducs(pProducts) {
    "use strict";
    pProducts.forEach(product => {
        const vProduct = gProductTemplate(product);
        $('#product-list').append(vProduct);
    });
}

/**
 * Hàm vẽ button readmore khi có TotalPages
 * Input: Chưa vẽ button
 * Output: Vẽ được button readmore nếu vẫn còn trang tiếp theo
 */
function buildPaging() {
    "use strict";
    // template cần vẽ
    const vReadMore = '<button class="btn btn-danger rounded-0 read-more">Read more</button>';
    // thêm vào thẻ parent div 
    $('#div-read-more').empty();
    $('#div-read-more').append(vReadMore);
}

/**
 * Hàm xử lý khi click button read more
 * Input: chưa load trang
 * Ouput: load trang mới
 */
function onBtnReadMoreClick() {
    "use strict";
    // show element spinner
    $('#div-spinner').show();
    var vPage = getPage();
    if (vPage.currentPage < vPage.totalPages - 1) {
        // set time show spinner
        setTimeout(function () {
            // load product with currentPage
            getProducts(vPage.currentPage + 1);
            // set currentPage up localStorage
            setCurrentPage(vPage.currentPage + 1);
            // hide element spinner
            $('#div-spinner').hide();
        }, 500);
    }
}

/**
 * Hàm set số page hiện tại khi load request mới
 * @param {*} pCurrentPage page hiện tại
 */
function setCurrentPage(pCurrentPage) {
    "use strict";
    // Khai báo Object và gán giá trị
    var vPage = {
        currentPage: 0,
        size: 6,
        totalPages: 0
    };
    vPage.currentPage = pCurrentPage;
    vPage.totalPages = gTotalPages;
    // set page localStorage
    localStorage.setItem(gPAGE_LOCAL_STORAGE, JSON.stringify(vPage));

    // set show hide button read more
    var vPage = getPage();
    if (vPage.currentPage < vPage.totalPages - 1) {
        $('#div-read-more').find('.read-more').show();
    } else {
        $('#div-read-more').find('.read-more').hide();
    }
}

/**
 * Hàm lấy currentPage và totalPages từ localStorage
 * @returns vResult Object chứa currentPage, size và totalPages
 */
function getPage() {
    // get Object from localStorage
    var vResult = localStorage.getItem(gPAGE_LOCAL_STORAGE);
    return JSON.parse(vResult);
}

/**
 * Hàm xử lý link đến trang chi tiết 'product.html' khi nhấn 1 image product
 * @param {*} pThis là đối tượng được click
 * Output: open page 'product.html' và truyền pProductId dưới dạng query
 */
function openPageProductDetail(pThis) {
    "use strict";
    // get data từ dataset
    var vProductId = $(pThis).data('product-id');
    const vProductFormUrl = 'pages/product.html';
    var vUrlSiteToOpen = vProductFormUrl + '?id=' + vProductId;
    window.location.href = vUrlSiteToOpen;
}
