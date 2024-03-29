/**
 * 模块处理，支持：Node，AMD，浏览器全局变量
 * root 指代全局变量
 * factory 指代下面的 Popper
 */
/*global define*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. 注册一个匿名模块
        define(factory)
    } else if (typeof module === 'object' && module.exports) {
        // Node环境。
        // 并不支持严格的 CommonJS，但是支持类似 Node 这样支持 module.exports 的类 CommonJS 环境
        module.exports = factory()
    } else {
        // Browser globals (root is window)
        // 浏览器的全局变量，root指代window
        root.Popper = factory()
    }
  }(this, function () {
  
    'use strict'
  
    // 全局变量，其实这里有更好的方法，但是因为只需要处理浏览器环境下的全局变量所以直接这样写了
    var root = window
  
    // 默认选项
    var DEFAULTS = {
        // popper 放置位置
        placement: 'bottom',
  
        // 是否开启 GPU 加速
        gpuAcceleration: true,
  
        // 根据给定的像素值将 popper 从原位置进行偏移（可以是负值）
        offset: 0,
  
        // popper 的边界元素
        boundariesElement: 'viewport',
  
        // popper 与边界元素的最小距离
        boundariesPadding: 5,
  
        // popper 会尝试以如下顺序防止溢出，默认情况下他可能在边界元素的左边界和上边界出现溢出
        preventOverflowOrder: ['left', 'right', 'top', 'bottom'],
  
        // 改变 popper 位置时的选项，默认是翻转到对称面上。
        flipBehavior: 'flip',
  
        // 箭头元素
        arrowElement: '[x-arrow]',
  
        // popper 偏移值的修饰符，用来在偏移值应用到 popper 之前进行修改
        modifiers: [ 'shift', 'offset', 'preventOverflow', 'keepTogether', 'arrow', 'flip', 'applyStyle'],
  
        // 不使用的函数
        modifiersIgnored: [],
  
        // 绝对定位
        forceAbsolute: false
    }
  
    /**
     * 创建 Popper.js 的实例
     * @constructor Popper
     * @param {HTMLElement} reference - 用来定位popper的相关元素
     * @param {HTMLElement|Object} popper 用来作为 popper 的HTML元素，或者用来生成 popper 的配置
     * @param {String} [popper.tagName='div'] 生成的 popper 的标签名
     * @param {Array} [popper.classNames=['popper']] 给生成的 popper 添加的类名数组
     * @param {Array} [popper.attributes] 通过 `attr:value` 的形式给 popper 添加属性
     * @param {HTMLElement|String} [popper.parent=window.document.body] 父元素的HTML元素或者查询字符串
     * @param {String} [popper.content=''] popper 的内容，可以是文本、HTML或者结点；如果不是文本，应当将 `contentType` 设置为 `html` 或者 `node`
     * @param {String} [popper.contentType='text'] 如果是 `html` 内容会变当做 HTML 解析；如果是 `node` 会原样插入
     * @param {String} [popper.arrowTagName='div'] 箭头元素的标签名
     * @param {Array} [popper.arrowClassNames='popper__arrow'] 应用于箭头元素的类名数组
     * @param {String} [popper.arrowAttributes=['x-arrow']] 应用于箭头元素的属性
     * @param {Object} options 选项
     * @param {String} [options.placement=bottom]
     *      popper 放置位置，可接受如下值：
     *          top(-start, -end)
     *          right(-start, -end)
     *          bottom(-start, -right)
     *          left(-start, -end)
     *
     * @param {HTMLElement|String} [options.arrowElement='[x-arrow]']
     *      用于 popper 的箭头的 DOM 结点，或者用来获取该节点的 CSS 选择器。
     *      它应当是父级 Popper 的孩子节点。
     *      Popper.js 会给该元素添加必须的样式来和它相关的元素对其。
     *      默认情况下，他会寻找 popper 子结点中包含 `x-arrow` 属性的结点。
     *
     * @param {Boolean} [options.gpuAcceleration=true]
     *      If set to false, the popper will be placed using `top` and `left` properties, not using the GPU.
     *      当这一属性被设置为 true 时，popper 的位置将通过 CSS3 的 translate3d 来改变。
     *      这样会让浏览器使用 GPU 来加速渲染过程。
     *      如果设置为 false，popper 将通过 `top` 和 `left` 属性来定位，并不会使用 GPU。
     *
     * @param {Number} [options.offset=0]
     *      popper 偏移的像素值（可以是负数）。
     *
     * @param {String|Element} [options.boundariesElement='viewport']
     *      用来定义 popper 边界的元素。
     *      popper 绝不会超出该边界（除非允许 `keepTogether`）。
     *
     * @param {Number} [options.boundariesPadding=5]
     *      边界的内边距。
     *
     * @param {Array} [options.preventOverflowOrder=['left', 'right', 'top', 'bottom']]
     *      Popper.js 根据这个顺序来避免溢出边界，他们会依次检测，这意味着最后的情况绝对不会溢出（即 right 和 bottom）。
     *
     * @param {String|Array} [options.flipBehavior='flip']
     *      用来指定 `flip` 修饰符的行为，这一修饰符是用来在 popper 要覆盖其相关元素时改变 popper 位置的。
     *      如果设置为 `flip`，popper 的位置将根据对称轴翻转（左右或者上下）。
     *      也可以传递位置数组（如 `['right', 'left', 'top']`）来手动指定需要改变时的位置顺序。
     *      （例如，在这个例子里，首先会从右边翻转到左边，然后如果仍然覆盖了相关元素，将会移动到上边）
     *
     * @param {Array} [options.modifiers=[ 'shift', 'offset', 'preventOverflow', 'keepTogether', 'arrow', 'flip', 'applyStyle']]
     *      用来改变应用到 popper 的数值的修饰符。
     *      可以添加自定义的函数来改变偏移值和位置。
     *      自定义的函数应当有 preventOverflow 的参数和返回值。
     *
     * @param {Array} [options.modifiersIgnored=[]]
     *      指定需要移除的内置的修饰符。
     *
     * @param {Boolean} [options.removeOnDestroy=false]
     *      当你想要在调用 `destroy` 方法时自动移除 popper 时，应当将此项设置为 true。
     */
    function Popper(reference, popper, options) {
        // 保存相关元素的引用，如果是 jQuery 实例，则取[0]，即获得原始的 HTML 结点
        this._reference = reference.jquery ? reference[0] : reference
        // 状态对象初始化
        this.state = {}
  
        // 如果 popper 变量是一个用来配置的对象，就通过解析它来生成 HTMLElement， 如果没有指定就生成一个默认的 popper
        var isNotDefined = typeof popper === 'undefined' || popper === null  // 判断是否定义了 popper
        var isConfig = popper && Object.prototype.toString.call(popper) === '[object Object]'  // 判断 popper 是不是对象
        if (isNotDefined || isConfig) {  // 如果没有定义并且有配置对象
            this._popper = this.parse(isConfig ? popper : {})  // 通过该配置生成，或者生成一个默认的
        }
        else {  // 否则使用给定的 HTMLElement 作为 popper
            this._popper = popper.jquery ? popper[0] : popper
        }
  
        // 合并默认选项和传参的选项生成新的选项
        this._options = Object.assign({}, DEFAULTS, options)
  
        // 重新生成修饰符列表
        this._options.modifiers = this._options.modifiers.map(function(modifier){
            // 移除忽略的修饰符
            if (this._options.modifiersIgnored.indexOf(modifier) !== -1) return
  
            // 将设置 x-placement 提到最前面，因为它会被用来给 popper 增加边距
            // 而边距将被用来计算正确的 popper 的偏移
            if (modifier === 'applyStyle') {
                this._popper.setAttribute('x-placement', this._options.placement)
            }
  
            // 返回内置的修饰符或者自定义的
            return this.modifiers[modifier] || modifier
        }.bind(this))
  
        // 确保在计算前已经应用了 popper 的位置
        this.state.position = this._getPosition(this._popper, this._reference)
        setStyle(this._popper, { position: this.state.position})
  
        // 触发 update 来让 popper 定位到正确的位置
        this.update()
  
        // 添加相关的事件监听，它们会在一定的情况下处理位置更新
        this._setupEventListeners()
        return this
    }
  
  
    //
    // 方法
    //
    /**
     * 销毁 popper
     * @method
     * @memberof Popper
     */
    Popper.prototype.destroy = function() {
        this._popper.removeAttribute('x-placement')  // 移除 x-placement 属性
        this._popper.style.left = ''  // left 设置为空
        this._popper.style.position = ''  // position 设置为空
        this._popper.style.top = ''  // top 设置为空
        this._popper.style[getSupportedPropertyName('transform')] = ''  // transform 设置为空
        this._removeEventListeners()  // 移除事件监听
  
        // 如果用户显式的调用了 destroy，就移除 popper
        if (this._options.removeOnDestroy) {
            this._popper.remove()  // 移除
        }
        return this
    }
  
    /**
     * 更新 popper 的位置，计算新的偏移并引用新的样式
     * @method
     * @memberof Popper
     */
    Popper.prototype.update = function() {
        var data = { instance: this, styles: {} }
  
        // 在 data 对象中存储位置信息，修饰符可以在需要的时候编辑该信息
        // 通过 _originalPlacement 保存原始的信息
        data.placement = this._options.placement
        data._originalPlacement = this._options.placement
  
        // 计算 popper 和相关元素的偏移，将结果放到 data.offsets 中
        data.offsets = this._getOffsets(this._popper, this._reference, data.placement)
  
        // 获取边界信息
        data.boundaries = this._getBoundaries(data, this._options.boundariesPadding, this._options.boundariesElement)
  
        // 执行相应的修饰符
        data = this.runModifiers(data, this._options.modifiers)
  
        // 调用更新的回调函数
        if (typeof this.state.updateCallback === 'function') {
            this.state.updateCallback(data)
        }
  
    }
  
    /**
     * 如果传了一个函数，将会以 popper 作为第一个参数执行
     * @method
     * @memberof Popper
     * @param {Function} callback
     */
    Popper.prototype.onCreate = function(callback) {
        callback(this)
        return this
    }
  
    /**
     * 如果传递了函数，将会在 popper 每次更新是执行。第一个参数是坐标等信息用来改变 popper 和它的箭头的样式
     * 注：在构造函数中的 `Popper.update()` 处并不会触发
     * @method
     * @memberof Popper
     * @param {Function} callback
     */
    Popper.prototype.onUpdate = function(callback) {
        this.state.updateCallback = callback
        return this
    }
  
    /**
     * 用来根据配置文件来生成 popper
     * @method
     * @memberof Popper
     * @param config {Object} configuration 配置信息
     * @returns {HTMLElement} popper
     */
    Popper.prototype.parse = function(config) {
        // 默认配置
        var defaultConfig = {
            tagName: 'div',
            classNames: [ 'popper' ],
            attributes: [],
            parent: root.document.body,
            content: '',
            contentType: 'text',
            arrowTagName: 'div',
            arrowClassNames: [ 'popper__arrow' ],
            arrowAttributes: [ 'x-arrow']
        }
        // 合并配置
        config = Object.assign({}, defaultConfig, config)
  
        // 文档对象
        var d = root.document
  
        // 创建 popper 元素
        var popper = d.createElement(config.tagName)
        // 添加相关的类名
        addClassNames(popper, config.classNames)
        // 添加相关的属性
        addAttributes(popper, config.attributes)
  
        if (config.contentType === 'node') {  // 如果内容是结点
            popper.appendChild(config.content.jquery ? config.content[0] : config.content)  // 直接插入相应的结点
        }else if (config.contentType === 'html') {  // 如果结点是 HTML
            popper.innerHTML = config.content  // 作为 HTML 渲染
        } else {
            popper.textContent = config.content  // 作为文本
        }
  
        if (config.arrowTagName) {  // 如果有箭头的标签名
            var arrow = d.createElement(config.arrowTagName)  // 创建相应标签
            addClassNames(arrow, config.arrowClassNames)  // 添加相应的类名
            addAttributes(arrow, config.arrowAttributes)  // 添加相应的属性
            popper.appendChild(arrow)  // 插入箭头
        }
  
        // 获取父元素
        var parent = config.parent.jquery ? config.parent[0] : config.parent
  
        // 如果 parent 是字符串，使用它来匹配元素
        // 如果匹配到多个元素，使用第一个元素作为父元素
        // 如果没有匹配到元素，抛出错误
        if (typeof parent === 'string') {
            parent = d.querySelectorAll(config.parent)  // 匹配相关元素
            if (parent.length > 1) {  // 警告匹配到多个元素
                window.console.warn('WARNING: the given `parent` query(' + config.parent + ') matched more than one element, the first one will be used')
            }
            if (parent.length === 0) {  // 没有匹配到元素则抛出错误
                throw 'ERROR: the given `parent` doesn\'t exists!'
            }
            parent = parent[0]  // 取第一个作为父元素
        }
  
        // 如果给定的 parent 是 DOM 结点列表或者多余一个元素的数组列表，都取第一个作为父元素
        if (parent.length > 1 && parent instanceof Element === false) {
            window.console.warn('WARNING: you have passed as parent a list of elements, the first one will be used')
            parent = parent[0]
        }
  
        // 将生成的 popper 插入父元素
        parent.appendChild(popper)
  
        // 返回 popper
        return popper
  
        /**
         * 为指定的元素添加类名
         * @function
         * @ignore
         * @param {HTMLElement} target 要添加类名的元素
         * @param {Array} classes 要添加的类名数组
         */
        function addClassNames(element, classNames) {
            classNames.forEach(function(className) {
                element.classList.add(className)
            })
        }
  
        /**
         * 为指定的元素添加属性
         * @function
         * @ignore
         * @param {HTMLElement} target 要添加属性的元素
         * @param {Array} attributes 要添加的属性数组，键值对通过 : 分割
         * @example
         * addAttributes(element, [ 'data-info:foobar' ])
         */
        function addAttributes(element, attributes) {
            attributes.forEach(function(attribute) {
                element.setAttribute(attribute.split(':')[0], attribute.split(':')[1] || '')
            })
        }
  
    }
  
    /**
     * 用来获取要应用到 popper 上的 position 信息
     * @method
     * @memberof Popper
     * @param popper {HTMLElement} popper元素
     * @param reference {HTMLElement} 相关元素
     * @returns {String} position 信息
     */
    Popper.prototype._getPosition = function(popper, reference) {
        var container = getOffsetParent(reference)  // 获取父元素的偏移
  
        if (this._options.forceAbsolute) {  // 强制使用绝对定位
            return 'absolute'
        }
  
        // 判断 popper 是否使用固定定位
        // 如果相关元素位于固定定位的元素中，popper 也应当使用固定固定定位来使它们可以同步滚动
        var isParentFixed = isFixed(reference, container)
        return isParentFixed ? 'fixed' : 'absolute'
    }
  
    /**
     * 获得 popper 的偏移量
     * @method
     * @memberof Popper
     * @access private
     * @param {Element} popper - popper 元素
     * @param {Element} reference - 相关元素（popper 将根据它定位）
     * @returns {Object} 包含将应用于 popper 的位移信息的对象
     */
    Popper.prototype._getOffsets = function(popper, reference, placement) {
        // 获取前缀
        placement = placement.split('-')[0]
        var popperOffsets = {}
  
        // 设置 position
        popperOffsets.position = this.state.position
        // 判断父元素是否固定定位
        var isParentFixed = popperOffsets.position === 'fixed'
  
        //
        // 获取相关元素的位置
        //
        var referenceOffsets = getOffsetRectRelativeToCustomParent(reference, getOffsetParent(popper), isParentFixed)
  
        //
        // 获取 popper 的大小
        //
        var popperRect = getOuterSizes(popper)
  
        //
        // 计算 popper 的偏移
        //
  
        // 根据 popper 放置位置的不同，我们用不同的方法计算
        if (['right', 'left'].indexOf(placement) !== -1) {  // 如果在水平方向，应当和相关元素垂直居中对齐
            // top 应当为相关元素的 top 加上二者的高度差的一半，这样才能保证垂直居中对齐
            popperOffsets.top = referenceOffsets.top + referenceOffsets.height / 2 - popperRect.height / 2
            if (placement === 'left') {  // 如果在左边，则 left 应为相关元素的 left 减去 popper 的宽度
                popperOffsets.left = referenceOffsets.left - popperRect.width
            } else {  // 如果在右边，则 left 应为相关元素的 right
                popperOffsets.left = referenceOffsets.right
            }
        } else {  // 如果在垂直方向，应当和相关元素水平居中对齐
            // left 应当为相关元素的 left 加上二者的宽度差的一半
            popperOffsets.left = referenceOffsets.left + referenceOffsets.width / 2 - popperRect.width / 2
            if (placement === 'top') {  // 如果在上边，则 top 应当为相关元素的 top 减去 popper 的高度
                popperOffsets.top = referenceOffsets.top - popperRect.height
            } else {  // 如果在下边，则 top 应当为 相关元素的 bottom
                popperOffsets.top = referenceOffsets.bottom
            }
        }
  
        // 给 popperOffsets 对象增加宽度和高度值
        popperOffsets.width   = popperRect.width
        popperOffsets.height  = popperRect.height
  
  
        return {
            popper: popperOffsets,  // popper 的相关信息
            reference: referenceOffsets  // 相关元素的相关信息
        }
    }
  
  
    /**
     * 初始化更新 popper 位置时用到的事件监听器
     * @method
     * @memberof Popper
     * @access private
     */
    Popper.prototype._setupEventListeners = function() {
        // 1 DOM access here
        // 注：这里会访问 DOM，原作者回复我说，这是他用来记录哪里访问到了 DOM
        this.state.updateBound = this.update.bind(this)
        // 浏览器窗口改变的时候更新边界
        root.addEventListener('resize', this.state.updateBound)
        // 如果边界元素是窗口，就不需要监听滚动事件
        if (this._options.boundariesElement !== 'window') {
            var target = getScrollParent(this._reference)  // 获取相关元素可滚动的父级
            // 这里可能是 `body` 或 `documentElement`（Firefox上），等价于要监听根元素
            if (target === root.document.body || target === root.document.documentElement) {
                target = root
            }
            // 监听滚动事件
            target.addEventListener('scroll', this.state.updateBound)
        }
    }
  
    /**
     * 移除更新 popper 位置时用到的事件监听器
     * @method
     * @memberof Popper
     * @access private
     */
    Popper.prototype._removeEventListeners = function() {
        // 注：这里会访问 DOM
        // 移除 resize 事件监听
        root.removeEventListener('resize', this.state.updateBound)
        if (this._options.boundariesElement !== 'window') {  // 如果边界元素不是窗口，说明还监听了滚动事件
            var target = getScrollParent(this._reference)
            if (target === root.document.body || target === root.document.documentElement) {
                target = root
            }
            // 移除滚动事件监听
            target.removeEventListener('scroll', this.state.updateBound)
        }
        // 更新回调摄者为空
        this.state.updateBound = null
    }
  
    /**
     * 计算边界限制并返回它们的值
     * @method
     * @memberof Popper
     * @access private
     * @param {Object} data - 通过 `_getOffsets` 生成的包含 offsets 属性信息的对象
     * @param {Number} padding - 边界内边距
     * @param {Element} boundariesElement - 用于定义边界的元素
     * @returns {Object} 边界的坐标
     */
    Popper.prototype._getBoundaries = function(data, padding, boundariesElement) {
        // 注：这里会访问 DOM
        var boundaries = {}
        var width, height
        if (boundariesElement === 'window') {  // 如果边界元素是窗口
            var body = root.document.body,
                html = root.document.documentElement
  
            // 取最大值
            height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )
            width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth )
  
            boundaries = {
                top: 0,
                right: width,
                bottom: height,
                left: 0
            }
        } else if (boundariesElement === 'viewport') {  // 如果边界元素时视窗
            var offsetParent = getOffsetParent(this._popper)  // 寻找 popper 定位的父元素
            var scrollParent = getScrollParent(this._popper)  // 寻找 popper 可滚动的父元素
            var offsetParentRect = getOffsetRect(offsetParent)  // 寻找 offsetParent 定位的父元素
  
            // 如果 popper 是固定定位，就不需要减去边界的滚动值
            var scrollTop = data.offsets.popper.position === 'fixed' ? 0 : scrollParent.scrollTop
            var scrollLeft = data.offsets.popper.position === 'fixed' ? 0 : scrollParent.scrollLeft
  
            boundaries = {
                top: 0 - (offsetParentRect.top - scrollTop),
                right: root.document.documentElement.clientWidth - (offsetParentRect.left - scrollLeft),
                bottom: root.document.documentElement.clientHeight - (offsetParentRect.top - scrollTop),
                left: 0 - (offsetParentRect.left - scrollLeft)
            }
        } else {
            if (getOffsetParent(this._popper) === boundariesElement) {
                boundaries = {
                    top: 0,
                    left: 0,
                    right: boundariesElement.clientWidth,
                    bottom: boundariesElement.clientHeight
                }
            } else {
                boundaries = getOffsetRect(boundariesElement)
            }
        }
        boundaries.left += padding
        boundaries.right -= padding
        boundaries.top = boundaries.top + padding
        boundaries.bottom = boundaries.bottom - padding
        return boundaries
    }
  
  
    /**
     * 循环遍历修饰符列表并且按顺序执行它们，它们都会修改数据对象
     * @method
     * @memberof Popper
     * @access public
     * @param {Object} data 数据
     * @param {Array} modifiers 修饰符列表
     * @param {Function} ends 要截止的修饰符名
     */
    Popper.prototype.runModifiers = function(data, modifiers, ends) {
        var modifiersToRun = modifiers.slice()  // 创建一个新的修饰符数组
        if (ends !== undefined) {  // 如果制定了 ends，就截断该数组
            modifiersToRun = this._options.modifiers.slice(0, getArrayKeyIndex(this._options.modifiers, ends))
        }
  
        modifiersToRun.forEach(function(modifier) {
            if (isFunction(modifier)) {  // 依次调用
                data = modifier.call(this, data)
            }
        }.bind(this))
  
        return data
    }
  
    /**
     * 用来得知给定的修饰符是否依赖另外一个
     * @method
     * @memberof Popper
     * @param {String} requesting - 要判断的修饰符
     * @param {String} requested - 被依赖的修饰符
     * @returns {Boolean}
     */
    Popper.prototype.isModifierRequired = function(requesting, requested) {
        var index = getArrayKeyIndex(this._options.modifiers, requesting)  // 获取要判断的修饰符的索引
        return !!this._options.modifiers.slice(0, index).filter(function(modifier) {  // 判断这之前有没有被依赖的修饰符
            return modifier === requested
        }).length
    }
  
    //
    // 修饰符
    //
  
    /**
     * 修饰符列表
     * @namespace Popper.modifiers
     * @memberof Popper
     * @type {Object}
     */
    Popper.prototype.modifiers = {}
  
    /**
     * 为 popper 元素应用计算后的样式
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 方法生成的数据对象
     * @returns {Object} 同一个数据对象
     */
    Popper.prototype.modifiers.applyStyle = function(data) {
        // 给 popper 应用最终的偏移
        // 注：这里会访问 DOM
        var styles = {
            position: data.offsets.popper.position
        }
  
        // 舍入 top 和 left 来放置文字模糊
        var left = Math.round(data.offsets.popper.left)
        var top = Math.round(data.offsets.popper.top)
  
        // 如果将 gpuAcceleration 设置为 true，并且浏览器支持 transform，将使用 translate3d 来应用位置
        // 如果需要我们会自动加上支持的浏览器前缀
        var prefixedProperty
        if (this._options.gpuAcceleration && (prefixedProperty = getSupportedPropertyName('transform'))) {
            styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)'
            styles.top = 0
            styles.left = 0
        }
        else {  // 否则，使用标准的 left 和 top 属性
            styles.left =left
            styles.top = top
        }
  
        // `data.styles` 里面的每一个出现的属性都会被应用到 popper 上
        // 通过这种方式我们可以制作第三方的修饰符并且对其自定义样式
        // 需要注意的是，修饰符可能会覆盖掉之前修饰符中定义的属性
        Object.assign(styles, data.styles)
  
        setStyle(this._popper, styles)
  
        // 赋值用来为 tooltip 设置样式的属性（用来正确定位箭头）
        // 注：这里会访问 DOM
        this._popper.setAttribute('x-placement', data.placement)
  
        // 如果用到了箭头修饰符并且箭头样式已经计算过就应用样式
        if (this.isModifierRequired(this.modifiers.applyStyle, this.modifiers.arrow) && data.offsets.arrow) {
            setStyle(data.arrowElement, data.offsets.arrow)
        }
  
        return data
    }
  
    /**
     * 用来将将 popper 移动到它相关联的元素的头或尾
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 通过 `update` 生成的数据对象
     * @returns {Object} 正确修改后的数据对象
     */
    Popper.prototype.modifiers.shift = function(data) {
        var placement = data.placement
        var basePlacement = placement.split('-')[0]  // 基本位置
        var shiftVariation = placement.split('-')[1]  // 偏移位置
  
        // if shift shiftVariation is specified, run the modifier
        // 如果制定了 shift shiftVariation 就执行该修饰符
        if (shiftVariation) {
            var reference = data.offsets.reference
            var popper = getPopperClientRect(data.offsets.popper)
  
            var shiftOffsets = {
                y: {
                    start:  { top: reference.top },
                    end:    { top: reference.top + reference.height - popper.height }
                },
                x: {
                    start:  { left: reference.left },
                    end:    { left: reference.left + reference.width - popper.width }
                }
            }
  
            // 判断坐标轴
            var axis = ['bottom', 'top'].indexOf(basePlacement) !== -1 ? 'x' : 'y'
  
            // 调整 popper
            data.offsets.popper = Object.assign(popper, shiftOffsets[axis][shiftVariation])
        }
  
        return data
    }
  
  
    /**
     * 用来保证 popper 不会覆盖边界的修饰符
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 通过 `update` 生成的数据对象
     * @returns {Object} 正确修改后的数据对象
     */
    Popper.prototype.modifiers.preventOverflow = function(data) {
        var order = this._options.preventOverflowOrder  // 检测顺序
        var popper = getPopperClientRect(data.offsets.popper)
  
        var check = {
            left: function() {  // 检测左边
                var left = popper.left
                if (popper.left < data.boundaries.left) {  // 如果 popper 更靠左
                    left = Math.max(popper.left, data.boundaries.left)  // left 取较大的
                }
                return { left: left }
            },
            right: function() {
                var left = popper.left
                if (popper.right > data.boundaries.right) {
                    left = Math.min(popper.left, data.boundaries.right - popper.width)
                }
                return { left: left }
            },
            top: function() {
                var top = popper.top
                if (popper.top < data.boundaries.top) {
                    top = Math.max(popper.top, data.boundaries.top)
                }
                return { top: top }
            },
            bottom: function() {
                var top = popper.top
                if (popper.bottom > data.boundaries.bottom) {
                    top = Math.min(popper.top, data.boundaries.bottom - popper.height)
                }
                return { top: top }
            }
        }
  
        order.forEach(function(direction) {
            // 修正位置
            data.offsets.popper = Object.assign(popper, check[direction]())
        })
  
        return data
    }
  
    /**
     * 确保 popper 总是靠近它的相关元素
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 通过 `_update` 生成的数据对象
     * @returns {Object} 正确修改后的数据对象
     */
    Popper.prototype.modifiers.keepTogether = function(data) {
        var popper  = getPopperClientRect(data.offsets.popper)
        var reference = data.offsets.reference
        var f = Math.floor  // 向下取整
  
        if (popper.right < f(reference.left)) {  // 修正在左边的 popper
            data.offsets.popper.left = f(reference.left) - popper.width
        }
        if (popper.left > f(reference.right)) {  // 修正在右边的 popper
            data.offsets.popper.left = f(reference.right)
        }
        if (popper.bottom < f(reference.top)) {  // 修正在上边的 popper
            data.offsets.popper.top = f(reference.top) - popper.height
        }
        if (popper.top > f(reference.bottom)) {  // 修正在下边的 popper
            data.offsets.popper.top = f(reference.bottom)
        }
  
        return data
    }
  
    /**
     * 如果 popper 覆盖了它的相关元素，就通过这个修饰符来让它翻转
     * 需要在 `preventOverflow` 修饰符后运行
     * **注：** 每当这个修饰符要翻转 popper 的时候，都会将它之前的修饰符执行一遍
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 通过 `_update` 生成的数据对象
     * @returns {Object} 正确修改后的数据对象
     */
    Popper.prototype.modifiers.flip = function(data) {
        // 检测 preventOverflow 在 flip 修饰符之前被应用
        // 否则 flip 并不会正确执行
        if (!this.isModifierRequired(this.modifiers.flip, this.modifiers.preventOverflow)) {
            window.console.warn('WARNING: preventOverflow modifier is required by flip modifier in order to work, be sure to include it before flip!')
            return data
        }
  
        if (data.flipped && data.placement === data._originalPlacement) {
            // 如果四周都没有足够的空间，flip 会一直循环
            return data
        }
  
        var placement = data.placement.split('-')[0]
        var placementOpposite = getOppositePlacement(placement)
        var variation = data.placement.split('-')[1] || ''
  
        var flipOrder = []
        if(this._options.flipBehavior === 'flip') {
            flipOrder = [
                placement,
                placementOpposite
            ]
        } else {
            flipOrder = this._options.flipBehavior
        }
  
        flipOrder.forEach(function(step, index) {
            if (placement !== step || flipOrder.length === index + 1) {
                return
            }
  
            placement = data.placement.split('-')[0]
            placementOpposite = getOppositePlacement(placement)
  
            var popperOffsets = getPopperClientRect(data.offsets.popper)
  
            // 用来区分左上和右下，用来区分翻转时不同的计算方式
            var a = ['right', 'bottom'].indexOf(placement) !== -1
  
            // 使用 Math.floor 来消除我们不想考虑的偏移的小数部分
            if (
                a && Math.floor(data.offsets.reference[placement]) > Math.floor(popperOffsets[placementOpposite]) ||
                !a && Math.floor(data.offsets.reference[placement]) < Math.floor(popperOffsets[placementOpposite])
            ) {
                // 使用这个布尔值来检测循环
                data.flipped = true
                data.placement = flipOrder[index + 1]
                if (variation) {
                    data.placement += '-' + variation
                }
                data.offsets.popper = this._getOffsets(this._popper, this._reference, data.placement).popper
  
                data = this.runModifiers(data, this._options.modifiers, this._flip)
            }
        }.bind(this))
        return data
    }
  
    /**
     * 用来给 popper 增加偏移的修饰符。可以用来更加精确的控制 popper 的位置。
     * 偏移将为改变 popper 距离它相关元素的位置。
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 通过 `_update` 生成的数据对象
     * @returns {Object} 正确修改后的数据对象
     */
    Popper.prototype.modifiers.offset = function(data) {
        var offset = this._options.offset
        var popper  = data.offsets.popper
  
        // 根据不同方向就行修改
        if (data.placement.indexOf('left') !== -1) {
            popper.top -= offset
        }
        else if (data.placement.indexOf('right') !== -1) {
            popper.top += offset
        }
        else if (data.placement.indexOf('top') !== -1) {
            popper.left -= offset
        }
        else if (data.placement.indexOf('bottom') !== -1) {
            popper.left += offset
        }
        return data
    }
  
    /**
     * Modifier used to move the arrows on the edge of the popper to make sure them are always between the popper and the reference element
     * It will use the CSS outer size of the arrow element to know how many pixels of conjuction are needed
     * 用来移动箭头来使其保持在相关元素和 popper 中间的修饰符。
     * 它会使用箭头元素 CSS 的外围尺寸来计算连接需要多少像素
     * @method
     * @memberof Popper.modifiers
     * @argument {Object} data - 通过 `_update` 生成的数据对象
     * @returns {Object} 正确修改后的数据对象
     */
    Popper.prototype.modifiers.arrow = function(data) {
        var arrow  = this._options.arrowElement
  
        // 如果 arrowElement 是字符串，就假定它是 CSS 选择器，并寻找它
        if (typeof arrow === 'string') {
            arrow = this._popper.querySelector(arrow)
        }
  
        // 如果没有找到箭头元素就不要运行这一个修饰符
        if (!arrow) {
            return data
        }
  
        // 箭头元素必须是 popper 的子元素
        if (!this._popper.contains(arrow)) {
            window.console.warn('WARNING: `arrowElement` must be child of its popper element!')
            return data
        }
  
        // 箭头依赖于 keepTogether
        if (!this.isModifierRequired(this.modifiers.arrow, this.modifiers.keepTogether)) {
            window.console.warn('WARNING: keepTogether modifier is required by arrow modifier in order to work, be sure to include it before arrow!')
            return data
        }
  
        var arrowStyle  = {}
        var placement   = data.placement.split('-')[0]
        var popper      = getPopperClientRect(data.offsets.popper)
        var reference   = data.offsets.reference
        var isVertical  = ['left', 'right'].indexOf(placement) !== -1  // 是否垂直
  
        var len         = isVertical ? 'height' : 'width'
        var side        = isVertical ? 'top' : 'left'
        var altSide     = isVertical ? 'left' : 'top'
        var opSide      = isVertical ? 'bottom' : 'right'
        var arrowSize   = getOuterSizes(arrow)[len]
  
        //
        // 扩展 keepTogether 来保证 popper 和它的相关元素有足够的空间来连接
        //
  
        // 上/左边
        if (reference[opSide] - arrowSize < popper[side]) {
            data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowSize)
        }
        // 下/右边
        if (reference[side] + arrowSize > popper[opSide]) {
            data.offsets.popper[side] += (reference[side] + arrowSize) - popper[opSide]
        }
  
        // 计算 popper 的中心
        var center = reference[side] + (reference[len] / 2) - (arrowSize / 2)
  
        var sideValue = center - popper[side]
  
        // 防止箭头处于无法连接 popper 的位置
        sideValue = Math.max(Math.min(popper[len] - arrowSize, sideValue), 0)
        arrowStyle[side] = sideValue
        arrowStyle[altSide] = '' // 确保移除肩头上的旧元素
  
        data.offsets.arrow = arrowStyle
        data.arrowElement = arrow
  
        return data
    }
  
  
    //
    // 工具函数
    //
  
    /**
     * 获得给定元素的外围尺寸（offset大小 + 外边距）
     * @function
     * @ignore
     * @argument {Element} element 要检测的元素
     * @returns {Object} 包含宽高信息的对象
     */
    function getOuterSizes(element) {
        // 注：这里会访问 DOM
        var _display = element.style.display,
            _visibility = element.style.visibility
        element.style.display = 'block' 
        element.style.visibility = 'hidden'
        //var calcWidthToForceRepaint = element.offsetWidth
  
        // original method
        // 原始方法
        var styles = root.getComputedStyle(element)  // 获取计算后的样式
        var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom)  // 上下边距
        var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight)  // 左右边距
        var result = { width: element.offsetWidth + y, height: element.offsetHeight + x }
  
        // 重置元素样式
        element.style.display = _display 
        element.style.visibility = _visibility
        return result
    }
  
    /**
     * 获取给定放置位置的相反位置
     * @function
     * @ignore
     * @argument {String} placement 给定位置
     * @returns {String} 给定位置的相反位置
     */
    function getOppositePlacement(placement) {
        var hash = {left: 'right', right: 'left', bottom: 'top', top: 'bottom' }
        return placement.replace(/left|right|bottom|top/g, function(matched){
            return hash[matched]
        })
    }
  
    /**
     * 对于给定的 popper 的偏移大小等属性，生成一个类似于 getBoundingClientRect 的输出
     * @function
     * @ignore
     * @argument {Object} popperOffsets 相关属性
     * @returns {Object}
     */
    function getPopperClientRect(popperOffsets) {
        var offsets = Object.assign({}, popperOffsets)
        offsets.right = offsets.left + offsets.width
        offsets.bottom = offsets.top + offsets.height
        return offsets
    }
  
    /**
     * 寻找数组中某个值的索引
     * @function
     * @ignore
     * @argument {Array} arr 要查询的数组
     * @argument keyToFind 要查询的值
     * @returns index or null
     */
    function getArrayKeyIndex(arr, keyToFind) {
        var i = 0, key
        for (key in arr) {  // 遍历
            if (arr[key] === keyToFind) {
                return i  // 寻找到了就返回索引
            }
            i++
        }
        return null
    }
  
    /**
     * 获取给定元素的 CSS 计算属性
     * @function
     * @ignore
     * @argument {Eement} element 给定的元素
     * @argument {String} property 属性
     */
    function getStyleComputedProperty(element, property) {
        // 注：这里会访问 DOM
        var css = root.getComputedStyle(element, null)
        return css[property]
    }
  
    /**
     * 返回给定元素用来计算偏移的父元素
     * @function
     * @ignore
     * @argument {Element} element
     * @returns {Element} offset parent
     */
    function getOffsetParent(element) {
        // 注：这里会访问 DOM
        var offsetParent = element.offsetParent
        return offsetParent === root.document.body || !offsetParent ? root.document.documentElement : offsetParent
    }
  
    /**
     * 返回给定元素用来计算滚动的父元素
     * @function
     * @ignore
     * @argument {Element} element
     * @returns {Element} scroll parent
     */
    function getScrollParent(element) {
        var parent = element.parentNode
  
        if (!parent) {  // 没有父级
            return element
        }
  
        if (parent === root.document) {
            // Firefox 会将 scrollTop的判断放置的 `documentElement` 而非 `body` 上
            // 我们将判断二者谁大于0来返回正确的元素
            if (root.document.body.scrollTop) {
                return root.document.body
            } else {
                return root.document.documentElement
            }
        }
  
        // Firefox 要求我们也要检查 `-x` 以及 `-y`
        if (
            ['scroll', 'auto'].indexOf(getStyleComputedProperty(parent, 'overflow')) !== -1 ||
            ['scroll', 'auto'].indexOf(getStyleComputedProperty(parent, 'overflow-x')) !== -1 ||
            ['scroll', 'auto'].indexOf(getStyleComputedProperty(parent, 'overflow-y')) !== -1
        ) {
            // 如果检测到的 scrollParent 是 body，我们将对其父元素做一次额外的检测
            // 这样在 Chrome 系的浏览器中会得到 body，其他情况下会得到 documentElement
            // 修复 issue #65
            return parent
        }
        return getScrollParent(element.parentNode)
    }
  
    /**
     * 判断给定元素是否固定或者在一个固定元素中
     * @function
     * @ignore
     * @argument {Element} element 给定的元素
     * @argument {Element} customContainer 自定义的容器
     * @returns {Boolean}
     */
    function isFixed(element) {
        if (element === root.document.body) {  // body 返回 false
            return false
        }
        if (getStyleComputedProperty(element, 'position') === 'fixed') {  // position 为 fixed
            return true
        }
        // 判断父元素是否固定
        return element.parentNode ? isFixed(element.parentNode) : element
    }
  
    /**
     * 为给定的 popper 设定样式
     * @function
     * @ignore
     * @argument {Element} element - 要设定样式的元素
     * @argument {Object} styles - 包含样式信息的对象
     */
    function setStyle(element, styles) {
        function is_numeric(n) {  // 是否是数字
            return (n !== '' && !isNaN(parseFloat(n)) && isFinite(n))
        }
        Object.keys(styles).forEach(function(prop) {
            var unit = ''
            // 为如下的属性增加单位
            if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && is_numeric(styles[prop])) {
                unit = 'px'
            }
            element.style[prop] = styles[prop] + unit
        })
    }
  
    /**
     * 判断给定的变量是否是函数
     * @function
     * @ignore
     * @argument {*} functionToCheck - 要检测的变量
     * @returns {Boolean}
     */
    function isFunction(functionToCheck) {
        var getType = {}
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
    }
  
    /**
     * 获取给定元素相对于其 offset 父元素的位置
     * @function
     * @ignore
     * @param {Element} element
     * @return {Object} position - 元素的坐标和 `scrollTop`
     */
    function getOffsetRect(element) {
        var elementRect = {
            width: element.offsetWidth,
            height: element.offsetHeight,
            left: element.offsetLeft,
            top: element.offsetTop
        }
  
        elementRect.right = elementRect.left + elementRect.width
        elementRect.bottom = elementRect.top + elementRect.height
  
        // 位置
        return elementRect
    }
  
    /**
     * Get bounding client rect of given element
     * 获取给定元素的边界
     * @function
     * @ignore
     * @param {HTMLElement} element
     * @return {Object} client rect
     */
    function getBoundingClientRect(element) {
        var rect = element.getBoundingClientRect()
  
        // IE11以下
        var isIE = navigator.userAgent.indexOf("MSIE") != -1
  
        // 修复 IE 的文档的边界 top 值总是 0 的bug
        var rectTop = isIE && element.tagName === 'HTML'
            ? -element.scrollTop
            : rect.top
  
        return {
            left: rect.left,
            top: rectTop,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.right - rect.left,
            height: rect.bottom - rectTop
        }
    }
  
    /**
     * 给定元素和它的一个父元素，返回 offset
     * @function
     * @ignore
     * @param {HTMLElement} element
     * @param {HTMLElement} parent
     * @return {Object} rect
     */
    function getOffsetRectRelativeToCustomParent(element, parent, fixed) {
        var elementRect = getBoundingClientRect(element)
        var parentRect = getBoundingClientRect(parent)
  
        if (fixed) {  // 固定定位
            var scrollParent = getScrollParent(parent)
            parentRect.top += scrollParent.scrollTop
            parentRect.bottom += scrollParent.scrollTop
            parentRect.left += scrollParent.scrollLeft
            parentRect.right += scrollParent.scrollLeft
        }
  
        var rect = {
            top: elementRect.top - parentRect.top ,
            left: elementRect.left - parentRect.left ,
            bottom: (elementRect.top - parentRect.top) + elementRect.height,
            right: (elementRect.left - parentRect.left) + elementRect.width,
            width: elementRect.width,
            height: elementRect.height
        }
        return rect
    }
  
    /**
     * 获取带有浏览器支持的前缀的属性名
     * @function
     * @ignore
     * @argument {String} property 驼峰式写法
     * @returns {String} 驼峰式的带有前缀的属性名
     */
    function getSupportedPropertyName(property) {
        var prefixes = ['', 'ms', 'webkit', 'moz', 'o']
  
        for (var i = 0; i < prefixes.length; i++) {
            var toCheck = prefixes[i] ? prefixes[i] + property.charAt(0).toUpperCase() + property.slice(1) : property
            if (typeof root.document.body.style[toCheck] !== 'undefined') {
                return toCheck
            }
        }
        return null
    }
  
    /**
     * 用来合并对象的可枚举属性
     * 这个 polyfill 并不支持 symbol 属性，因为 ES5 根本没有 symbol
     * 源代码: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     * @function
     * @ignore
     */
    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            enumerable: false,  // 不可枚举
            configurable: true,  // 可配置
            writable: true,  // 可写
            value: function(target) {
                if (target === undefined || target === null) {  // 目标对象不合法
                    throw new TypeError('Cannot convert first argument to object')
                }
  
                var to = Object(target)
                // 依次赋值
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i]
                    if (nextSource === undefined || nextSource === null) {
                        continue
                    }
                    nextSource = Object(nextSource)
  
                    var keysArray = Object.keys(nextSource)
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex]
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey)
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey]
                        }
                    }
                }
                return to
            }
        })
    }
  
    return Popper
  }))
  