window.selectPhoto = []; //用户已选择的图片列表
/**
 * 判断浏览器是不是微信浏览器
 * 
 * @author ZhengGuoQing
 */
function judgeBrowser() {
    var browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {     //移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }
    if (browser.versions.mobile) {
        //判断是否是移动设备打开。browser代码在下面
        var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            //在微信中打开
            return "MicroMessenger";
        }
        if (ua.match(/WeiBo/i) == "weibo") {
            //在新浪微博客户端打开
            return "WeiBo";
        }
        if (ua.match(/QQ/i) == "qq") {
            //在QQ空间打开
            return "QQ";
        }
        if (browser.versions.ios) {
            //是否在IOS浏览器打开
            return "IOS";
        }
        if (browser.versions.android) {
            //是否在安卓浏览器打开
            return "android";
        }
        return "other";
    } else {
        //否则就是PC浏览器打开
        return "PC";
    }
}

/**
 *简单的判断是不是微信客户端，如果是，使用jssdk，否则使用FileAPI
 *
 * @author ZhengGuoQing
 */
function judgeBrowser2() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        //在微信中打开
        return "MicroMessenger";
    } else {
        return false;
    }
}

$(function() {
    
    initPaperType(); //初始化纸张选择类型
    if (judgeBrowser2() == "MicroMessenger") {
        //微信中打开的
        ///初始化，获取签名
        wxSignature();

        //点击上传图片或文件，绑定上传事件
        $("#uploadBox").on('click', selectFileType);
    } else {
        //不是微信中打开的
        $(".new-input-upload-file").css("display","block");
        FileAPIUploadFile("chooseUploadFile3");
    }
});

/**
 * 选择文件类型，图片或文件
 * 
 * @author ZhengGuoQing
 */
function selectFileType() {
    weui.actionSheet([
        {
            label: '照片',
            onClick: function () {
                
            }
        }, {
            label: '文件',
            onClick: function () {
            }
        }
    ], [
        {
            label: '取消',
            onClick: function () {
                console.log('取消');
            }
        }
    ], {
        className: 'select-file-type',
        isAndroid: false
    });
    var cell = $(".weui-actionsheet__cell")[1];
    $(cell).append('<input id="chooseUploadFile" name="allFile_upload" type="file" multiple="true" />')
    var photoItem = $(".weui-actionsheet__cell")[0];
    $(photoItem).on('click', clickSelectPhoto);
    $(cell).on('click', clickSelectFile);
}

/**
 * 用户点击选择照片
 * 
 * @author ZhengGuoQing
 */
function clickSelectPhoto() {
    wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            showFilePage(); //显示这个页面
            renderFilePage(localIds, "image"); //将图片渲染到页面上
        }
    });
}
/**
 * 用户点击选择文件
 * 
 * @author ZhengGuoQing
 */
function clickSelectFile() {
    FileAPIUploadFile("chooseUploadFile");
}

/**
 * 获取微信签名,动态的获取签名
 * 
 * @author ZhengGuoQing
 */
function wxSignature() {
    var link = encodeURIComponent(location.href.split('#')[0]);
    $.ajax({
        url: 'https://www.huakewang.com/wxapi/get_share_params/' + link,
        type: 'POST',
        dataType: 'JSON',
        success: function (res) {
            var res = JSON.parse(res);
            if (res.success) {
                wxInit(res.data.timestamp, res.data.nonceStr, res.data.signature, res.data.url);
            } else {
                console.log(res.message);
            }
        },
        error: function (xhr, type) {
            console.log(xhr, type);
        }
    });
}

/**
 * 初始化微信jssdk
 * 
 * @author ZhengGuoQing
 */
function wxInit(timestamp, nonceStr, signature, link) {
    wx.config({
        debug: false,
        appId: 'wx04301edcd16d6d92',
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature,// 必填，签名，见附录1
        jsApiList: ['checkJsApi', 'chooseImage', 'previewImage', 'uploadImage', 'getLocalImgData']
    });
    wx.ready(function () {
        wx.checkJsApi({
            jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'getLocalImgData'],
            success: function (res) {
                //接口测试成功;
            },
            fail: function (res) {
                //不支持微信jssdk,换上传插件
                $("#uploadBox").off('click', selectFileType);
                $(".new-input-upload-file").css("display","block");
                FileAPIUploadFile("chooseUploadFile3");
            }
        });
        wx.error(function (res) {
            console.log("初始化错误");
            console.log(res);
        });
    });
}

/**
 * 显示第二页，查看文件上传进度的页面
 * 
 * @author ZhengGuoQing
 */
function showFilePage() {
    $("#root").css("left","0");
    var token = setTimeout(function (){
        window.positionReactUploadInput();
        clearTimeout(token);
    }, 1000);
}

/**
 * 当用户选择图片后，渲染文件列表
 * 
 * @author ZhengGuoQing
 */
function renderFilePage(localIds, renderType, realFileData, oldSelectPhotoLength) {
    
    window.ReactAppSetState({ selectPhoto: localIds, renderType: renderType },function(){
        window.ReactSetFormatPhoto(function(){
            if (renderType == "image") {
                window.ReactUploadImages(0);
            }
            if (renderType == "file" && realFileData) {
                FileAPIUpload(0, realFileData, oldSelectPhotoLength)
            }
        });
    })
}

function FileAPIUploadFile(domId) {
    var choose = document.getElementById(domId);
    FileAPI.event.on(choose, 'change', FileAPIHandle);
}
window.FileAPIUploadFile = FileAPIUploadFile;
function FileAPIHandle(evt) {
    var files = FileAPI.getFiles(evt);
    var formatError = false;
    var sizeError = false;
    FileAPI.filterFiles(files, function (file, info/**Object*/) {
        
        if (/doc$|docx$|ppt$|pptx$|xls$|xlsx$|pdf$|txt$|jpg$|jpeg$|png$|gif$|bmp$|tif$/.test(file.name)) {
            if (file.size > 200 * FileAPI.MB) {
                sizeError = true;
                return false;
            } else {
                return true;
            };
        } else {
            formatError = true;
            return false;
        };
    }, function (files/**Array*/, rejected/**Array*/) {
        if (sizeError) {
            alert("文件大小不能超过200M");
        }
        if (formatError) {
            alert("请上传正确格式的文件！");
        }
        if (rejected.length > 0) {
            //有错误，直接返回
            return;
        }

        if (files.length) {
            showFilePage(); //显示上传进度页面

            fileToPreviewImage(files); //渲染图片  
        }
    });
    FileAPI.reset(evt.currentTarget);
}

/**
 * 上传文件
 * 
 * @author ZhengGuoQing
 * @param {any} file 文件对象
 */
function FileAPIUpload(i, files, oldSelectPhotoLength) {
    
    if (files.length <= i || i > 100) {
        //上传文档完毕;

        window.ReactAppSetState({ uploadIng: false })
        return;
    } else {
        if (window.ReactState.uploadIng == false) {
            window.ReactAppSetState({ uploadIng: true })
        }
    }
    //上传文件
    FileAPI.upload({
        url: 'https://p.oyewifi.com/php/file_uploading.php',
        files: {
            Filedata: files[i]
        },
        fileprogress: function (evt/**Object*/, file/**Object*/, xhr/**Object*/, options/**Object*/) {
            var pr = parseInt(evt.loaded / evt.total * 100); //上传进度
            
            window.ReactSetOnePhotoProgress(oldSelectPhotoLength, (pr ? pr : 0));
            
        },
        complete: function (err, xhr) {
            if (!err) {
                //上传成功

                //重要提醒，因为文件有删除按钮，文件上传成功后，必须返回一个id，当调用删除接口时，传给服务器该id.
                var response = JSON.parse(xhr.responseText);
                if (response.id) {
                    var ReactServerIds = window.ReactState.serverIds;
                    ReactServerIds.push(response.id);
                    window.ReactAppSetState({
                        serverIds: ReactServerIds
                    });
                }

                window.ReactSetOnePhotoProgress(oldSelectPhotoLength, 100);
                i++;
                oldSelectPhotoLength++;
                FileAPIUpload(i, files, oldSelectPhotoLength);
            } else {
                //上传失败，将图片的服务器ID设置为-1
                var ReactServerIds = window.ReactState.serverIds;
                ReactServerIds.push("-1");
                window.ReactAppSetState({
                    serverIds: ReactServerIds
                });

                //发生错误,上传下一张
                window.ReactSetOnePhotoProgress(oldSelectPhotoLength, -1);
                i++;
                oldSelectPhotoLength++;
                FileAPIUpload(i, files, oldSelectPhotoLength);
            }
        }
    });
}

/**
 * 根据文件名称后缀，选择相应的图片显示封面吧
 * 
 * @author ZhengGuoQing
 */
function fileToPreviewImage(files) {
    
    var selectPhoto = []; //图片地址
    var ReactStateSelectPhoto = window.ReactState.selectPhoto;
    var oldSelectPhotoLength = ReactStateSelectPhoto.length;
    if (oldSelectPhotoLength > 0) {
        selectPhoto = ReactStateSelectPhoto;
    }
    var file_eq = 0; //文件索引
    var img_eq = 0;  //图片索引
    files.map(function(value, index, elem){
        
        //上传文件也可以选择图片
        if (!/^image/.test(value.type)) {
            var valueArray = value.name.split(".");
            var SuffixName = valueArray[valueArray.length - 1];

            var src = '../image/' + SuffixName + '.png';
            selectPhoto.push(src);
            file_eq++;
            if (file_eq + img_eq >= elem.length) {
                renderFilePage(selectPhoto, "file", files, oldSelectPhotoLength); //将文件的封面渲染到页面上
            }
        } else {
            var img = FileAPI.Image(value);
            img.preview(128, 128).get(function (err/**String*/, img/**HTMLElement*/) {
                
                var dataURL = canvasToDataURL(img, value.type);
                selectPhoto.push(dataURL);
                img_eq++;
                if (file_eq + img_eq >= elem.length) {
                    renderFilePage(selectPhoto, "file", files, oldSelectPhotoLength); //将文件的封面渲染到页面上
                }
            })
        }
    });

}
function canvasToDataURL(canvas, format, quality) {
    return canvas.toDataURL(format || 'image/jpeg', quality || 1.0);
}
/**
 *初始化，纸张类型选择相关点击事件
 *
 * @authorZhengGuoQing
 */
function initPaperType() {
    $("#paper-type-box").on('click', clickPaperType);
    $("#paper-type-box").on('touchstart', handleTouchStart);
    $("#paper-type-box").on('touchend', handleTouchEnd);
    $("#paper-type-box").on('touchcancel', handleTouchEnd); 

    //点击遮罩层，弹窗消失
    //点击选项，弹窗也得消失
    $("#popover-paper-type").on('click', clickMaskPaperType);
}

function handleTouchStart() {
    $("#paper-type-box").addClass("active");
}
function handleTouchEnd() {
    $("#paper-type-box").removeClass("active");
} 

/**
 *纸张类型点击事件
 *
 * @authorZhengGuoQing
 */
function clickPaperType() {
    var PaperType = $("#popover-paper-type");
    if (PaperType.hasClass("open")) {
        //弹窗已经打开
        PaperType.removeClass("open");

    } else {
        //弹窗已经关闭
        PaperType.addClass("open");
        positionPaperType(); //定位,只能是在弹窗打开后定位。

    }
}

function clickMaskPaperType() {
    var PaperType = $("#popover-paper-type");
    PaperType.removeClass("open");
}

/**
 *纸张类型弹窗定位
 *
 * @authorZhengGuoQing
 */
function positionPaperType() {
    var icon = $("#paper-type-icon")[0];
    var top = icon.offsetTop;
    var left = icon.offsetLeft;
    $("#popover-box")[0].style.top = top + 60 + "px";
    $(".popover-arrow")[0].style.top = top + 50 + "px";

    //计算三角形箭头的偏移量
    var interval = ($("body").width() - $("#popover-box").width() ) / 2;
    $("#popover-arrow")[0].style.left = left + 10 + "px";

}

/**
 *定位react图片预览页面的输入框位置
 *
 * @authorZhengGuoQing
 */
function positionReactUploadInput() {
    var inputHook = $("#inputHook");
    
    var uploadInput = $("#chooseUploadFile2");
    if (!inputHook[0]) {
        uploadInput[0].style.display = "none";
    } else {
        var offset = inputHook.offset();
        var top = offset.top;
        var left = offset.left;
        var widthHook = offset.width;
        var heightHook = offset.height;
        
        uploadInput[0].style.display = "block";
        uploadInput[0].style.top = top + "px";
        uploadInput[0].style.left = left + "px";
        uploadInput[0].style.width = widthHook + "px";
        uploadInput[0].style.height = heightHook + "px";
    } 
}

/**
 * 将使用React框架的Photo.jsx中有关服务器对接的代码抽离出来
 * 
 * 该函数在成功上传图片到微信服务器并返回serverId后调用,只有微信端上传图片会用这个函数，其他环境上传图片是直接上传到自己的服务器
 * 
 * 使用微信jssdk的wx.uploadImage接口上传图片后，会返回 serverId（即 media_id），利用 serverId 可以去微信服务器将文件下载到自己的服务器。
 *
 * @author ZhengGuoQing
 * @param {*} serverId  微信图片id
 */
function wxUploadImageToServer(serverId) {
    //调用接口，将serverId发送给后端，个人服务器下载微信服务器的图片

}

/**
 * 将使用React框架的Photo.jsx中有关服务器对接的代码抽离出来
 * 
 * 删除通过微信服务器上传的某张图片
 * 
 * 在调用删除图片的接口成功返回后，需要调用callBack回调函数，更新页面，移除刚刚删除的那张图片
 *
 * @author ZhengGuoQing
 * @param {*} serverId  微信图片id
 * @param {*} callBack  定义在React框架Photo.jsx里的回调函数，在页面上移除刚刚删除的那张图片
 */
function deletePhotoToWx(serverId, callBack) {
    //调用接口，将serverId发送给后端

    callBack(); //该回调函数应该在接口返回成功后调用。保证服务器先成功删除照片，然后网页界面移除照片
}

/**
 * 将使用React框架的Photo.jsx中有关服务器对接的代码抽离出来
 * 
 * 删除个人服务器上的某个文件
 * 
 * 在调用删除文件的接口成功返回后，需要调用callBack回调函数，更新页面，移除刚刚删除的那个文件
 *
 * @author ZhengGuoQing
 * @param {*} serverId  文件的服务器id
 * @param {*} callBack  定义在React框架Photo.jsx里的回调函数，在页面上移除刚刚删除的那个文件
 */
function deletePhotoToServer(serverId, callBack) {
    //调用接口，将serverId发送给后端

    callBack(); //该回调函数应该在接口返回成功后调用。保证服务器先成功删除文件，然后网页界面移除那个文件
}