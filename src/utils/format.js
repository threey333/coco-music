const format = (interval) => {
  // | 运算符后面的数为零的时候是取正数的功能，即去掉小数，只保留整数。
  interval = interval | 0
  const minute = interval / 60 | 0 // 分
  const second = interval % 60// 秒
  return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
}

export { format }
