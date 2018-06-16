;(function (window, document) {
    function myQuery(selector) {
        return new init(selector);
    }

    /*当做构造函数来用*/
    function init(selector) {
        if (typeof selector == "string") { // 如果是字符串就是选择器
            this.ele = document.querySelector(selector);
        } else if (typeof selector == "object") {
            this.ele = selector;
        }
    }

    init.prototype = {
        tap: function (callBack) {
            if (typeof callBack != "function") return this;
            var ele = this.ele;
            ele.addEventListener("touchstart", handler);

            function handler(event) {
                var touch = event.changedTouches[0];
                callBack.call(ele, {type: "tap", clientX: touch.clientX, clientY: touch.clientY});
            }

            return this;  // 为了链式调用做准备
        },
        pan: function (callBack) {
            if (typeof callBack != "function") return this;

            var ele = this.ele;
            ele.addEventListener("touchstart", handler);
            ele.addEventListener("touchmove", handler);
            ele.addEventListener("touchend", handler);
            var startX = 0, startY = 0, deltaX = 0, deltaY = 0;
            var lastTime, lastDeltaX = 0, lastDeltaY = 0, speedX = 0, speedY = 0;

            function handler(event) {
                var touch = event.changedTouches[0];
                var type = event.type;
                if (type == "touchstart") {
                    deltaX = 0;
                    deltaY = 0;
                    speedX = 0;
                    speedY = 0;
                    startX = touch.clientX;
                    startY = touch.clientY;
                    lastTime = new Date();
                    callBack.call(ele, {
                        type: "panstart",
                        start: true,
                        deltaX: 0,
                        deltaY: 0,
                        speedX: 0,
                        speedY: 0
                    });
                } else if (type == "touchmove") {
                    deltaX = touch.clientX - startX;
                    deltaY = touch.clientY - startY;
                    /*计算手指允许速度*/
                    var currentTime = new Date();
                    var deltaTime = currentTime - lastTime;
                    /*两次move之间的时间差*/
                    speedX = (deltaX - lastDeltaX) / deltaTime * 1000;
                    /*deltaX - lastDeltaX 两次move之间的距离差*/
                    speedY = (deltaY - lastDeltaY) / deltaTime * 1000;
                    callBack.call(ele, {
                        type: "panmove",
                        deltaX: deltaX,
                        deltaY: deltaY,
                        speedX: speedX,
                        speedY: speedY
                    });
                    lastDeltaX = deltaX;
                    /*保存当前的距离, 为下一次计算速度做准备*/
                    lastDeltaY = deltaY;
                    lastTime = currentTime;
                } else {  // end告诉库的使用者, pan事件结束了
                    callBack.call(ele, {
                        type: "panend",
                        deltaX: deltaX,
                        deltaY: deltaY,
                        speedX: speedX,
                        speedY: speedY,
                        end: true
                    })
                }
            }

            return this;
        },
        scrollBar: function (red, width) {
            var ele = this.ele;
            var parent = this.ele.parentElement;
            if (ele.offsetHeight <= parent.offsetHeight) return;
            /*如果父容器没有定位, 给父容器添加合适的定位.*/
            if (getCssValue(parent, "position") == "static") {
                parent.style.position = "relative";
            }
            /*创建一个span, 给他响应的样式, 然后成为wrap的下一个兄弟*/
            var span = document.createElement("span");
            var style = span.style;
            style.position = "absolute";
            style.backgroundColor = red;
            style.width = width + "px";
            style.height = parent.offsetHeight * parent.offsetHeight / ele.offsetHeight + "px";
            style.right = "2px";
            style.top = "0px";
            style.borderRadius = width / 2 + "px";
            style.opacity = "0";
            style.transition = "opacity 1s";
            ele.parentElement.insertBefore(span, ele.nextElementSibling);
            return this;
        },
        scroll: function (d1, scrolling) {
            var ele = this.ele;
            var bar = ele.nextElementSibling;

            if (scrolling) {
                bar.style.transition = "opacity 1s";
            } else {
                bar.style.transition = "opacity 1s 0.5s";
            }
            bar.style.opacity = scrolling ? "1" : "0";
            var parent = ele.parentElement;
            var max1 = ele.offsetHeight - parent.offsetHeight;
            var max2 = parent.offsetHeight - bar.offsetHeight;
            var d2 = -d1 * max2 / max1;
            d2 = d2 <= 0 ? 0 : d2;
            d2 = d2 >= max2 ? max2 : d2;
            bar.style.transform = "translateY(" + d2 + "px)";
        },
        /**
         *  设置3d变换, 传递的参数, 3个都必须传
         */
        transform: function (name, v1 = 0, v2 = 0, v3 = 0) {
            var ele = this.ele;
            if (name == "translate3d") {
                ele.style.transform = "translate3d(" + v1 + "px," + v2 + "px," + v3 + "px)";
            } else if (name == "rotate3d") {
                ele.style.transform = "rotate3d(" + v1 + "deg," + v2 + "deg," + v3 + "deg)";
            } else if (name == "scale3d") {
                ele.style.transform = "scale3d(" + v1 + "," + v2 + "," + v3 + ")";
            }
            return this;
        },
        toggle: function () {
            var display = window.getComputedStyle(this.ele, null)["display"];
            if (display == "block") {
                this.hide();
            } else if (display == "none") {
                this.show();
            }
            return this;
        },
        show: function () {
            this.ele.style.display = "block";
            return this;
        },
        hide: function () {
            this.ele.style.display = "none";
            return this;
        },
        tx: function () {
            var m = window.getComputedStyle(this.ele, null)["transform"];
            var arr = m.split(",");
            return +arr[arr.length - 2];
        },
        ty: function () {
            var m = window.getComputedStyle(this.ele, null)["transform"];
            var arr = m.split(",");
            return +arr[arr.length - 1].replace(")", "");
        },

        scale: function (callBack) {
            var ele = this.ele;
            ele.addEventListener("touchstart", handler);
            ele.addEventListener("touchsmove", handler);
            ele.addEventListener("touchsend", handler);

            var scale, startDis;

            function handler(event) {
                var type = event.type;
                var touches = event.targetTouches;
                if (touches.length == 2) {
                    if (type == "touchstart") {
                        startDis = dis(touches);
                        callBack.call(ele, {type: "scalestart", scale: 1});
                    } else if (type == "touchmove") {
                        scale = dis(touches) / startDis;
                        callBack.call(ele, {type: "scaling", scale: scale});
                    }
                } else if (touches.length == 1) {
                    if (type == "touchend") {
                        callBack.call(ele, {type: "scaleend", scale: scale})
                    }
                }
            }
        }
    }
    // 给window注册两个变量
    window.$ = window.myQuery = myQuery;

    /*获取指定的css的值*/
    function getCssValue(ele, name) {
        return window.getComputedStyle(ele, null)[name];
    }

    function dis(touches) {
        return Math.sqrt((touches[0].clientX - touches[1].clientX) ** 2 + (touches[0].clientY - touches[1].clientY) ** 2);
    }
})(window, document);