"use strict";
const gLOGIN_URL = 'http://localhost:8080/api/login';

$(document).ready(function () {

    // Kiểm tra token nếu có token tức người dùng đã đăng nhập
    const token = getCookie("token");
    if (token) { window.location.href = "index.html"; }

    // event button login
    $('#btn-login').on('click', onBtnLoginClick);
});

// Hàm xử lý khi click button login
function onBtnLoginClick() {
    "use strict";
    event.preventDefault();
    var vLogin = {
        username: '',
        password: ''
    }
    // read data
    readData(vLogin);
    // validate
    if (validateForm(vLogin)) {
        // process data
        signinForm(vLogin);
    }
}

// Đọc data người dùng đăng nhập
function readData(pLogin) {
    "use strict";
    pLogin.username = $.trim($('#inp-user-name').val());
    pLogin.password = $.trim($('#pwd-password').val());
    console.log(pLogin);
    return pLogin;
}

// Validate dữ liệu từ form
function validateForm(pLogin) {
    var vMess = '';
    if (!pLogin.username) {
        vMess = 'Input your username !';
        console.assert(false, '100: ' + vMess);
        toastr.error(vMess);
        $('#inp-user-name').focus();
        return false;
    }
    if (!pLogin.password) {
        vMess = "Input your password !";
        console.assert(false, '200: ' + vMess);
        toastr.error(vMess);
        $('#pwd-password').focus();
        return false;
    }
    return true;
}

function signinForm(pLogin) {
    var vLoginUrl = gLOGIN_URL;

    $.ajax({
        type: "POST",
        url: vLoginUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify(pLogin),
        success: function (responseObject) {
            // debugger;
            responseHandler(responseObject);
        },
        error: function (error) {
            console.assert(error.responseText);
            toastr.error(error.responseText);
        }
    });
}

// Xử lý object trả về khi login thành công
function responseHandler(pDataResponse) {
    //Lưu token vào cookie trong 1 ngày
    setCookie("token", pDataResponse, 1);
    console.log(pDataResponse);
    window.location.href = "index.html";
}

// Hàm setCookie
function setCookie(pName, pValue, pExdays) {
    var vDate = new Date();
    vDate.setTime(vDate.getTime() + (pExdays * 24 * 60 * 60 * 1000));
    var vExpires = "expires=" + vDate.toUTCString();
    document.cookie = pName + "=" + pValue + ";" + vExpires + ";path=/";
}

// Hàm get Cookie
function getCookie(pName) {
    var vName = pName + "=";
    var vDecodedCookie = decodeURIComponent(document.cookie);
    var vCa = vDecodedCookie.split(';');
    for (var bI = 0; bI < vCa.length; bI++) {
        var vC = vCa[bI];
        while (vC.charAt(0) == ' ') {
            vC = vC.substring(1);
        }
        if (vC.indexOf(vName) == 0) {
            return vC.substring(vName.length, vC.length);
        }
    }
    return "";
}



