/**
 * treeselect组件
 * 陈少俊
 * qq:446252517
 * 2018-11-29
 */
layui.define(['tree', 'jquery'], function (exports) {
    "use strict";


    //加载CSS（导入模块名称与本模块名称一致时加载css，否则手动加载css）
    var cssurl = layui.cache.modules["treeselect"].replace('.js', '.css');
    if (cssurl)
        layui.link(cssurl);


    var _MOD = "treeselect",
        $ = layui.jquery,
        tree = layui.tree,
        hint = layui.hint(),
        win = $(window),
        //外部接口
        treeSelect = {
            v: "2.0.0",
            //全局配置
            config: {},
            //设置全局项
            set: function (options) {
                var that = this;
                that.config = $.extend({}, that.config, options);
                return that;
            }
        },
        //当前实例
        thisTreeSelect = function () {
            var that = this;
            return {
                render:function(options){
                    var inst = new treeSelectClass($.extend({},that.config,options));
                    return thisTreeSelect.call(inst);
                },
                config: that.config
            }
        },
        //构造器
        treeSelectClass = function (options) {
            var that = this;
            that.config = $.extend({}, that.config, treeSelect.config, options);
            that.render();
        }



    //默认参数
    treeSelectClass.prototype.config = {
        elem: null, //渲染的dom
        data: null, //数据集 
        url: null,  //ajax数据源
        method: "GET",//ajax请求方式，设置url有效
        selected: function () { },//选中回调
        selectby: "all",//all：全部可选，fu:可选有子节点的节点，zi：只能选最后一级节点
        search: false,//启用搜索框
        done: function () { },//渲染完成回调
        datakey: null, //ajax返回数据的字段
        valueKey: 'id', //选择结果赋值字段 原控件赋值 默认 id
        textKey: 'name' //选择结果显示字段 替换控件赋值 默认 name
    }
    //扩展属性
    treeSelectClass.prototype.render = function (options) {
        options = this.config;
        if (!options.elem) return hint.error("treeselect 组件未指定 elem，无法完成渲染！"), false;
        var CLASS = 'layui-form-select',
            TITLE = 'layui-select-title',
            NONE = 'layui-select-none',
            that = this,
            othis = $(options.elem),
            placeholder = othis.attr("placeholder") ? othis.attr("placeholder") : "请选择",
            //扩展方法
            init = function () {
                var hasRender = othis.next('.' + CLASS),
                    disabled = othis[0].disabled,
                    treeData = options.data,
                    treeId = 'treeselect-tree-' + options.elem.replace("#", "").replace(".", "");
                //获取tree数据(ajax)
                if (!treeData && options.url) {
                    $.ajax({
                        url: options.url,
                        dataType: "json",
                        type: options.method,
                        success: function (d) {
                            options.data = options.datakey ? d[options.datakey] : d;
                            init.call(this);
                        }
                    });
                    return;
                }
                //判断数据
                if (!hasRender[0]) {
                    if (!treeData)
                        treeData = [{ id: "", name: "清除选择项", children: null }];
                    else
                        //添加清除选择项
                        treeData.splice(0, 0, { id: "", name: "清除选择项", children: null });//如果这个报错，请检查返回的数据是否满足tree组件的数据格式要求
                }
                //隐藏原控件
                othis.hide();
                othis.addClass("layui-input-treeselect");
                //替代元素
                var eleArray = [
                    '<div class="' + CLASS + (disabled ? ' layui-select-disabled' : '') + '" >',
                    '<div class="' + TITLE + '"><input type="text" placeholder="' + placeholder + '" readonly class="layui-input' + (disabled ? (' ' + DISABLED) : '') + '">',
                    '<i class="layui-edge"></i></div>',
                    '<div class="layui-anim layui-anim-upbit" style="position: relative;z-index:1;">',
                    '<ul id=' + treeId + ' class="layui-tree"></ul>',
                ];
                if (options.search) {
                    eleArray.push(
                        '<div class="layui-treeselect-serach">',
                        '<input type="text" id="treeSearch" placeholder="輸入关键字搜索" class="layui-input"/>',
                        '<i class="layui-icon layui-icon-search" style="position: absolute; right: 10px; bottom: 5px; color: silver;"></i>',
                        '</div>'
                    );
                }
                eleArray.push(
                    '</div>',
                    '</div>'
                );
                var reElem = $(eleArray.join(''));
                //如果已经渲染，则Rerender
                hasRender[0] && hasRender.remove();
                //添加替代元素到DOM
                othis.after(reElem);
                //渲染Tree
                layui.tree({
                    elem: "#" + treeId,
                    click: function (obj) {
                        if ((options.selectby === "fu" && !obj.children) || (options.selectby === "zi" && !!obj.children))
                            return false;
                        othis.val(obj[options.valueKey]).removeClass('layui-form-danger');
                        othis.change();
                        hideDown(reElem);
                        return false;
                    },
                    nodes: treeData
                });
                //添加tree项目事件
                $("#" + treeId + " a:not(':first')")
                    .on("click", function (e) {
                        $("#" + treeId + " .layui-this").removeClass("layui-this");
                        $(this).addClass('layui-this');
                    });
                $("#" + treeId + " a:first").click(function () { $("#" + treeId + " .layui-this").removeClass("layui-this"); });
                //绑定原控件默认值
                setText.call(this, reElem, treeId, treeData);
                //添加事件
                events.call(this, reElem, disabled);
                //监听原控件改变事件
                othis.change(function () {
                    setText.call(this, reElem, treeId, treeData);
                });
                //渲染完成回调
                if (options.done)
                    options.done();
            },
            //绑定事件
            events = function (reElem, disabled) {
                if (disabled) return;
                var titleObj = reElem.find('.' + TITLE),
                    inputObj = titleObj.find('input'),
                    searchObj = reElem.find(".layui-treeselect-serach"),
                    treeObj = reElem.find('.layui-tree')
                    ;
                //点击标题区域
                titleObj.click(function (e) {
                    reElem.hasClass(CLASS + 'ed')
                        ? hideDown(reElem)
                        : (hide(e, true), showDown(reElem));
                    treeObj.find('.' + NONE).remove();
                });
                //点击箭头获取焦点
                titleObj.find('.layui-edge').click(function () { inputObj.focus(); });
                //键盘事件
                inputObj.on('keyup',
                    function (e) {
                        //Tab键
                        if (e.keyCode === 9)
                            showDown(reElem);
                    })
                    .on('keydown',
                        function (e) {
                            var keyCode = e.keyCode;
                            //Tab键
                            if (keyCode === 9) {
                                hideDown(reElem);
                            } else if (keyCode === 13) { //回车键
                                e.preventDefault();
                            }
                        });
                //点击树箭头不隐藏
                treeObj.find(".layui-tree-spread").on('click',
                    function () {
                        return false;
                    });
                //搜索框
                var treeSearchKey = "";
                searchObj.on('click', function () { return false; });
                searchObj.on('keyup',
                    function (e) {
                        var key = e.target.value;
                        if (treeSearchKey === key) return;
                        treeSearchKey = key;
                        var $o = treeObj.find("li");
                        $o.show();
                        $o.not(":contains('" + key + "')").hide();
                    });
                //关闭下拉
                $(document).off('click', hide).on('click', hide);
            },
            //设置选择结果
            setText = function (reElem, treeId, treeData) {
                var value = othis.val(),
                    inputObj = reElem.find('.' + TITLE).find('input'),
                    findData = function (treeData, val) {
                        var text = null;
                        //遍历treeData
                        $.each(treeData, function (i, one) {
                            if (val == one[options.valueKey]) {
                                text = one[options.textKey];
                                if (options.selectcall)
                                    options.selectcall(one);
                                return false;
                            }
                            if (one.children) {
                                text = findData(one.children, val);
                                if (text)
                                    return false;
                            }
                        });
                        return text;
                    };
                $("#" + treeId + " .layui-this").removeClass("layui-this");
                //清空
                if (!value) {
                    inputObj.val('');
                    if (options.selectcall)
                        options.selectcall(null);
                }
                //设置值 
                else {
                    var text = findData(treeData, value);
                    inputObj.val(text);
                    //设置tree选中
                    var tree_a = $("#" + treeId + " a");
                    $.each(tree_a, function (i, one) {
                        if ($(one).find('cite').text() == text)
                            return $(one).addClass("layui-this"), false;
                    });
                }
            },
            //展开下拉
            showDown = function (reElem) {
                var treeObj = reElem.find('.layui-tree'),
                    searchObj = reElem.find(".layui-treeselect-serach");
                var top = reElem.offset().top + reElem.outerHeight() + 5 - win.scrollTop(),
                    downHeight = win.height() - top - 13,
                    dlHeight = treeObj.outerHeight();
                if (options.search) {
                    downHeight -= 30;
                    treeObj.css("margin-top", "29px");
                } else
                    searchObj.remove();
                if (downHeight < 300)
                    treeObj.css("max-height", downHeight + "px");

                reElem.addClass(CLASS + 'ed');

                //上下定位识别
                if (top + dlHeight > win.height() && top >= dlHeight) {
                    reElem.addClass(CLASS + 'up');
                }
            },
            //收起下拉
            hideDown = function (reElem) {
                reElem.removeClass(CLASS + 'ed ' + CLASS + 'up');
                reElem.find('.' + TITLE).find('input').blur();
            },
            hide = function (e, clear) {
                if (!$(e.target).parent().hasClass(TITLE) || clear) {
                    $('.' + CLASS).removeClass(CLASS + 'ed ' + CLASS + 'up');
                    //thatInput && initValue && thatInput.val(initValue);
                }
                //thatInput = null;
            };
        init();
        return this;
    }

    //核心入口  
    treeSelect.render = function (options) {
        var inst = new treeSelectClass(options);
        return thisTreeSelect.call(inst);
    };
    exports(_MOD, treeSelect);
});    