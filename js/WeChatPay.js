$(function(){
    $("#paperTypePickerCell").on('click', picker); 
    $("#paperTypePickerCell").on('touchstart', handleTouchStart); 
    $("#paperTypePickerCell").on('touchend', handleTouchEnd); 
    $("#paperTypePickerCell").on('touchcancel', handleTouchEnd); 
    handleClickStepper(); //给输入框绑定事件
    computePagesNumber(); //初始化时也计算一次总页数
    noBackspace(); //绑定禁止浏览器回退的操作
});

function handleTouchStart() {
    $("#paperTypePickerCell").css("background-color","rgba(0,0,0,0.05)");
} 
function handleTouchEnd() {
    $("#paperTypePickerCell").css("background-color", "initial");
}
/**
 *禁止回退
 *
 * @author ZhengGuoQing
 */
function noBackspace() {
    if (window.history && window.history.pushState) {
        history.pushState(null, null, document.URL);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, document.URL);
            confirmHistoryBack()
        });
    }
} 

function confirmHistoryBack() {
    weui.confirm("返回将删除已选文件", {
        className: "delete-photo-confirm",
        title: "确认返回吗?",
        buttons: [{
            label: '取消',
            type: 'default',
            onClick: function () {}
        }, {
            label: '确定',
            type: 'primary',
            onClick: function () {
                history.pushState(null, null, "../html/index.html");
                window.location.reload();
            }
        }]
    });
}

/**
 * 选择纸张类型,单列picker
 */
function picker() {
    weui.picker([
        {
            label: 'A4黑白',//显示的文字
            value: 0.10,// 纸张的价格
        },
        {
            label: 'A4彩色',
            value: 1
        },
        {
            label: 'A2黑白',
            value: 0.20
        },
        {
            label: 'A5彩色-2元/页',
            value: 2,
        }
        ,
        {
            label: 'A2高保真-10元/页',
            value: 10,
        }
    ], {
        className: 'mew-paper-type-picker',
        container: 'body',
        defaultValue: [0],
        onChange: function (result) {
        },
        onConfirm: function (result) {
            console.log(result)
            console.log(result[0].value)
            var label = result[0].label; //显示的文字
            var value = result[0].value; // 纸张的价格
            $("#paperTypeTxt").html(label);
            $("#unitPrice").html(value);
            
            computeTotalPrice();//计算总价
        },
        id: 'paperTypePicker'
    });
}

/**
 * 给输入框绑定事件
 * 
 * @author ZhengGuoQing
 */
function handleClickStepper() {
    var StepperDOM = $(".number-stepper");
    var plusButton = StepperDOM.find(".button-right");
    var reduceButton = StepperDOM.find(".button-left");
    var stepperInput = StepperDOM.find(".stepper-input");
    plusButton.on('click', plusClick);
    reduceButton.on('click', reduceClick);
    stepperInput.on('input', changeStepperInput);
    stepperInput.on('blur', blurStepperInput);

    plusButton.on('touchstart', function(e){
        plusButton.css("opacity","0.5");
    });
    plusButton.on('touchend', function (e) {
        plusButton.css("opacity", "1");
    });

    reduceButton.on('touchstart', function (e) {
        reduceButton.css("opacity", "0.5");
    });
    reduceButton.on('touchend', function (e) {
        reduceButton.css("opacity", "1");
    });
    

}

function plusClick() {
    var value = $(".stepper-input").val();
    value = parseInt(value);
    if (!isNaN(value)) {
        value++;
    } else {
        value = 1;
    }

    $(".stepper-input").val(value);
    reduceButtonStyle();//设置按钮颜色
    computePagesNumber(); //计算总页数
    
}
function reduceClick() {
    var value = $(".stepper-input").val();
    value = parseInt(value);
    if (!isNaN(value)) {
        if (value > 1) {
            value--;
        } else {
            value = 1;
        }
    } else {
        value = 1;
    }
    $(".stepper-input").val(value);
    reduceButtonStyle();//设置按钮颜色
    computePagesNumber(); //计算总页数
}

/**
 * 设置按钮颜色
 * 
 * @author ZhengGuoQing
 */
function reduceButtonStyle() {
    var value = $(".stepper-input").val();
    var reduceButton = $(".number-stepper .button-left");
    if (value > 1) {
        reduceButton.removeClass("gray");
    } else {
        reduceButton.addClass("gray");
    }
}

function changeStepperInput() {
    var value = $(".stepper-input").val();
    if (value == '') {
        return;
    }
    value = parseInt(value);
    var StepperDOM = $(".number-stepper");
    var reduceButton = StepperDOM.find(".button-left");
    if (!isNaN(value)) {
        if (value < 1) {
            $(".stepper-input").val(1);
        }
    }else {
        $(".stepper-input").val(1);
    }

    reduceButtonStyle();//设置按钮颜色
    computePagesNumber(); //计算总页数
}

function blurStepperInput() {
    var value = $(".stepper-input").val();
    if (value != '') {
        return;
    }

    $(".stepper-input").val(1);
    reduceButtonStyle();//设置按钮颜色
    computePagesNumber(); //计算总页数
}

/**
 * 计算并显示页数
 * 
 * @author ZhengGuoQing
 */
function computePagesNumber() {
    var fileNumber = parseInt($("#fileNumber").html());
    var pagesNumber = parseInt($("#pagesNumber").html());
    var stepperInput = parseInt($("#stepperInput").val());
    if (!isNaN(fileNumber) && !isNaN(pagesNumber) && !isNaN(stepperInput)) {
        $("#sumPagesNumber").html(parseInt(fileNumber * pagesNumber * stepperInput));
    }
    
    computeTotalPrice();//计算总价
}

/**
 * 计算总金额
 * 
 * @author ZhengGuoQing
 */
function computeTotalPrice() {
    var sumPagesNumber = parseInt($("#sumPagesNumber").html());
    var unitPrice = parseFloat($("#unitPrice").html());
    
    if (!isNaN(sumPagesNumber) && !isNaN(unitPrice)) {
        var sumPrice = (sumPagesNumber * unitPrice).toFixed(2);  
        $("#sumPrice").html(sumPrice);
    }
}