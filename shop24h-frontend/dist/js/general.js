"use strict";
const gCART = 'CART';
$(document).ready(function () {
    // Show notification
    buildNotification();

    // detect scroll top or down
    showHideMenu();

    // defaul value height, weight
    $('#lbl-height').html($('#inp-slider-height').val());
    $('#lbl-weight').html($('#inp-slider-weight').val());

    // load value slider height on lable
    $('#inp-slider-height').on('input', function () {
        $('#lbl-height').html($(this).val());
    });

    // load value slider weight on lable
    $('#inp-slider-weight').on('input', function () {
        $('#lbl-weight').html($(this).val());
    });


});

/**
 * Hàm xử lý detect menu khi scroll top or down
 * Input: show menu
 * Output: hide or show menu khi scroll top or down
 */
function showHideMenu() {
    "use strict";
    // add padding top to show content behind navbar
    $('body').css('padding-top', $('.navbar').outerHeight() + 'px')

    // detect scroll top or down
    if ($('.smart-scroll').length > 0) { // check if element exists
        var last_scroll_top = 0;
        $(window).on('scroll', function () {
            var scroll_top = $(this).scrollTop();
            if (scroll_top < last_scroll_top) {
                $('.smart-scroll').removeClass('scrolled-down').addClass('scrolled-up');
            }
            else {
                $('.smart-scroll').removeClass('scrolled-up').addClass('scrolled-down');
            }
            last_scroll_top = scroll_top;
        });
    }
}


// Hàm hiển thị notification cart
function buildNotification() {
    "use trict";
    var vQuantityInCart = 0;
    var vProducts = getCart();
    if (vProducts.items.length !== 0) {
        vProducts.items.forEach(product => {
            vQuantityInCart += product.quantityOrder;
        });
        $('#span-quantity-in-cart').html(vQuantityInCart);
    } else {
        $('#span-quantity-in-cart').html('');
    }
}

/**
 * Hàm lấy giá trị được lưu trong giỏ hàng từ localStorage
 * @returns lấy được object chứa list product
 */
 function getCart() {
    var vResult = localStorage.getItem(gCART);
    // console.log('Cart: ', JSON.parse(vResult));
    return JSON.parse(vResult);
}
