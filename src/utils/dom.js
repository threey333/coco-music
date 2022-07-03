/**
 * 给dom添加样式
 * @param {dom} el dom
 * @param {string} className 类名
 *
 **/

const addClass = (el, className) => {
  if (!hasClass(el, className)) {
    el.classList.add(className)
  } else {
    return 0
  }
}

/**
 *判断dom是否存在该样式
 **/
const hasClass = (el, className) => {
  return el.classList.contains(className)
}

/**
 * 设置或者获取dom元素的data-属性
 * @param {dom} el dom
 * @param {属性} name
 * @param {*} val
 */
const getData = (el, name, val) => {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

const elementStyle = document.createElement('div').style

const vendor = (() => {
  // 各个浏览器厂商的前缀
  const transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (const key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  // 如果都不满足，那这个浏览器肯定有毛病
  return false
})()

/**
 * css3属性添加前缀
 * @export
 * @param {any} style 样式
 * @returns 前缀+style
 */
const prefixStyle = (style) => {
  if (vendor === false) {
    return false
  }

  // standard即标准，意思就是css属性如果是标准的，就直接返回该样式属性
  if (vendor === 'standard') {
    return style
  }

  // 首字母大写加上后面一部分
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}

export { addClass, hasClass, getData, prefixStyle }
