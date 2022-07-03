const Util = {}

// 在某个范围内抽取一个数，比如在8~12中随机选一个数，下面的函数能实现这个功能
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 洗牌函数(即打乱函数)
 * 修改的是arr的副本，对本数组不做影响
 * @param {array} arr arr
 * slice() 方法返回一个新的数组对象,由 begin 和 end 决定的原数组的浅拷贝。
 */
Util.shuffle = (arr) => {
  const _arr = arr.slice()
  for (let i = 0, length = _arr.length; i < length; i++) {
    const j = getRandomInt(0, i)
      // 数组中的两个位置的值进行交换
      ;[_arr[i], _arr[j]] = [_arr[j], _arr[i]]
  }
  return _arr
}

/**
 * 节流函数
 * @param {*} func 函数体
 * @param {*} delay 延时
 */
Util.debounce = (func, delay) => {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 数组去重
 * @param {*} array 数组
 */
Util.dedupe = (array) => {
  return Array.from(new Set(array))
}

/**
 * 把二维数组拍平,这里默认只扁平一次，扁平完就返回。
 * @param {*} children 二位数组
 */
Util.simpleNormalizeChildren = (children) => {
  for (let i = 0, length = children.length; i < length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  // 如果该数组里面没有嵌套数组，那么直接返回
  return children
}

export default Util
