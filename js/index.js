/*全局的移动默认行为取消*/
;(function (){
    var wrap = document.querySelector(".wrap");
    document.addEventListener("touchstart", function (event){
        event.preventDefault();
    })
})();

/*rem适配*/
var size;
    (function (designWidth){
    size = document.documentElement.clientWidth / (designWidth / 100);
    document.documentElement.style.fontSize = size + "px";
    document.body.style.fontSize = "14px";
}(1080));


(function(){
    headerMenuShowHide();
    navDispose();
    slideShow();
    mainNav();
    mainContent();
    window.onload = function () {
        addScrollBar();
    };
    // 头部菜单显示与隐藏
    function headerMenuShowHide() {
        $(".click_menu").tap(function (event) {
            $(".menu").toggle();
        })
        document.addEventListener("touchstart",function () {
            if(event.changedTouches[0].target.id != "click_menu") {
                $(".menu").hide();
            }
        })
    }
    
    //导航处理
    function navDispose() {
        var clickIndex = 0;
        var lis = document.querySelectorAll(".nav-wrap .nav li");
        for(var i = 0 ; i < lis.length ; i++){
            lis[i].index = i;
            $(lis[i]).tap(function (event){
                lis[clickIndex].classList.remove("active");
                this.classList.add("active");
                clickIndex = this.index;
            });
        }
        var initX = 0;
        $(".nav").pan(function (event) {
            this.style.transition = "";
            var deltaX = event.deltaX;
            $(this).transform("translate3d", deltaX + initX, 0, 0);
            if(event.end) {
                initX += deltaX;
                if (initX >= 0) {
                    initX = 0 ;
                    this.style.transition = "transform 0.4s cubic-bezier(.28,.19,.95,1.75)";
                    $(this).transform("translate3d", initX, 0, 0);
                }else if(initX < -this.offsetWidth + this.parentElement.offsetWidth){
                    initX = -this.offsetWidth + this.parentElement.offsetWidth;
                    this.style.transition = "transform 0.4s cubic-bezier(.28,.19,.95,1.75)";
                    $(this).transform("translate3d", initX, 0, 0);
                }
            }
        })
    }

    // 轮播图
    function slideShow() {
        var slide = document.querySelector(".slide");
        var inds = document.querySelectorAll(".ind span");
        var w = window.innerWidth;
        var startX;
        var currentIndex = 0;
        var lastIndex = currentIndex;
        $(".slide").pan(function (event) {
            if(event.start){
                clearInterval(id);
                startX = $(this).tx();
            }
            $(this).transform("translate3d",event.deltaX + startX);
            if(event.end){
                autoPlay();
                var i = Math.round(event.deltaX  / w);
                currentIndex -= i;
                this.style.transition = "transform,0.4s";
                $(this).transform("translate3d",i*w+startX);
            }
        })
        slide.addEventListener("transitionend",function (event) {
            this.style.transition = "";
            if(currentIndex <= -1){
                currentIndex = 4;
                $(this).transform("translate3d", -currentIndex * w);
            }else if(currentIndex >= 5){
                currentIndex = 0;
                $(this).transform("translate3d",0);
            }
            inds[lastIndex].classList.remove("active");
            inds[currentIndex].classList.add("active");
            lastIndex = currentIndex;
        })

        autoPlay();
        var id;
        function autoPlay() {
            id = setInterval(function () {
                currentIndex++;
                slide.style.transition = "transform 0.4s";
                $(slide).transform("translate3d",-currentIndex *w);
            },2000)
        }
    }

    // 滚动条
    function addScrollBar() {
        $(".content").scrollBar("grey",4);
        var startY;
        $(".content").pan(function (event) {
            if (!event.start && !event.end && Math.abs(event.deltaY) < 20) return;

            if(event.start){
                this.style.transition = "";
                startY = $(this).ty();
            }


            $(this).transform("translate3d",0,startY + event.deltaY)
            $(this).scroll(startY + event.deltaY,true);

            if(event.end){
                var ty = $(this).ty();
                $(this).scroll(ty,false);
                if(ty >= 0){
                    this.style.transition = "transform 0.6s"
                    $(this).transform("translate3d",0,0);
                }else if(ty<= -(this.offsetHeight + 2.7 * size - this . parentElement.offsetHeight)){
                    this.style.transition = "transform 0.6s";
                    $(this).transform("translate3d",0,-(this.offsetHeight + 2.7 * size - this . parentElement.offsetHeight));
                }
            }
        })
    }
    
    // 内容区导航
    function mainNav() {
        var lis = document.querySelectorAll(".mainNav li");
        var span = document.querySelector(".mainNav span");
        var lastIndex = 0;
        for(var i = 0 ; i < lis.length ; i++){
            lis[i].index = i;
            var left;
            $(lis[i]).tap(function (event) {
                left = this.index * 1.2;
                if(this.index == lastIndex)return;
                this.classList.add("active");
                lis[lastIndex].classList.remove("active");
                span.style.left = left + "rem";
                lastIndex = this.index;
            })
        }
    }

    // 主题内容拖动
    function mainContent() {
        var mainContent = document.querySelector(".mainContent");
        var w= window.innerWidth;
        var currentIndex = 0 ;
        var startX;
        $(".mainContent").pan(function (event) {
            if(event.start){
                this.style.transition = "";
                startX = $(this).tx();
            }
            $(this).transform("translate3d",startX + event.deltaX);
            if(event.end){
                this.style.transition = "transform .4s";
                currentIndex += Math.round(event.deltaX / w);
                $(mainContent).transform("translate3d", currentIndex * w);
            }
        })
        mainContent.addEventListener("transitionend", function (event){
            setTimeout(function (){
                currentIndex = 0;
                mainContent.style.transition = "";
                $(mainContent).transform("translate3d", 0);
            }, 1000);
        })
    }
})();