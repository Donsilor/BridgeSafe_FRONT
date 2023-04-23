import Vue from 'vue'
import router from '@/router'
import store from '@/store'
import $http from './httpRequest'

/**
 * 是否有权限
 * @param {*} key
 */
export function hasPermission(key) {
  return JSON.parse(sessionStorage.getItem('permissions') || '[]').indexOf(key) !== -1 || false
}
/**
 * 树形数据转换
 * @param {*} data list数据
 * @param {*} id 主键ID
 * @param {*} pid 上级ID
 * @param childrenKey 子list数据的key
 */
export function treeDataTranslate(data, id = 'id', pid = 'parentId', childrenKey = 'children') {
  let res = []
  let temp = {}
  for (let i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (let k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]][childrenKey]) {
        temp[data[k][pid]][childrenKey] = []
      }
      if (!temp[data[k][pid]]['_level']) {
        temp[data[k][pid]]['_level'] = 1
      }
      data[k]['_level'] = temp[data[k][pid]]._level + 1
      temp[data[k][pid]][childrenKey].push(data[k])
    } else {
      res.push(data[k])
    }
  }
  return res
}
/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  Vue.cookie.delete('token')
  store.commit('resetStore')
  router.options.isAddDynamicMenuRoutes = false
}

/**
 * 表单对象赋值:
 * 对目标对象存在且源对象同样存在的属性，全部覆盖；
 * 目标对象不存在但是源对象存在的属性， 全部丢弃；
 * 目标对象存在但是源对象不存在的属性，如果是字符串赋值为空串，其余类型赋值为undefined
 */
export function recover(target, source) {
  if (target === undefined || target === null) { throw new TypeError('Cannot convert first argument to object') }
  var to = Object(target)
  if (source === undefined || source === null) { return to }
  var keysArray = Object.keys(Object(target))
  for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
    var nextKey = keysArray[nextIndex]
    var desc = Object.getOwnPropertyDescriptor(target, nextKey)
    if (desc !== undefined && desc.enumerable) {
      if (to.hasOwnProperty(nextKey)) {
        if (to[nextKey] instanceof Array) {
          to[nextKey] = source[nextKey]
        } else if (to[nextKey] instanceof Object) {
          recover(to[nextKey], source[nextKey])
        } else if (source[nextKey] !== undefined) {
          to[nextKey] = source[nextKey]
        } else if (typeof (to[nextKey]) === 'string') {
          to[nextKey] = ''
        } else {
          to[nextKey] = undefined
        }
      }
    }
  }
  return to
}

/**
 * 表单对象赋值:
 * 对目标对象存在且源对象同样存在的属性，全部覆盖；
 * 目标对象不存在但是源对象存在的属性， 全部丢弃；
 * 目标对象存在但是源对象不存在的属性，保留目标对象的属性不做处理
 */
export function recoverNotNull(target, source) {
  if (target === undefined || target === null) { throw new TypeError('Cannot convert first argument to object') }
  var to = Object(target)
  if (source === undefined || source === null) { return to }
  var keysArray = Object.keys(Object(target))
  for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
    var nextKey = keysArray[nextIndex]
    var desc = Object.getOwnPropertyDescriptor(target, nextKey)
    if (desc !== undefined && desc.enumerable) {
      if (to.hasOwnProperty(nextKey)) {
        if (to[nextKey] instanceof Array) {
          to[nextKey] = source[nextKey]
        } else if (to[nextKey] instanceof Object) {
          recover(to[nextKey], source[nextKey])
        } else if (source[nextKey] !== undefined) {
          to[nextKey] = source[nextKey]
        }
      }
    }
  }
  return to
}
export function download(url, params) {
  $http({
    method: 'get',
    url: url,
    params: params,
    responseType: 'blob'
  }).then(response => {
    if (!response) {
      return
    }
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([response.data]))
    link.target = '_blank'
    let filename = response.headers['content-disposition']
    link.download = decodeURI(filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // eslint-disable-next-line handle-callback-err
  }).catch((error) => {

  })
}

export function escapeHTML(a) {
  a = '' + a
  return a.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
/**
* @function unescapeHTML 还原html脚本 < > & " '
* @param a -
*            字符串
*/
export function unescapeHTML(a) {
  a = '' + a
  return a.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
}

export function printLogo() {
  console.info(
    '%c欢迎使用%c桥隧运维平台',
    'color: #ffffff; background: #000000; padding:5px 10px 5px 10px;font-size:40px;border-radius:12px 0 0 12px;', 'color: #000000; background: #FE9A00; padding:5px 10px;font-size:40px;border-radius:0 12px 12px 0;')
}

/**
 * 对象深拷贝
 */
export function deepClone(data) {
  var type = getObjType(data)
  var obj
  if (type === 'array') {
    obj = []
  } else if (type === 'object') {
    obj = {}
  } else {
    // 不再具有下一层次
    return data
  }
  if (type === 'array') {
    for (var i = 0, len = data.length; i < len; i++) {
      data[i] = (function () {
        if (data[i] === 0) {
          return data[i]
        }
        return data[i]
      }())
      delete data[i].$parent
      obj.push(deepClone(data[i]))
    }
  } else if (type === 'object') {
    for (var key in data) {
      delete data.$parent
      obj[key] = deepClone(data[key])
    }
  }
  return obj
};

export function getObjType(obj) {
  var toString = Object.prototype.toString
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  if (obj instanceof Element) {
    return 'element'
  }
  return map[toString.call(obj)]
};
export function validatenull(val) {
  // 特殊判断
  if (val && parseInt(val) === 0) return false
  var list = ['$parent']
  if (typeof val === 'boolean') {
    return false
  }
  if (typeof val === 'number') {
    return false
  }
  if (val instanceof Array) {
    if (val.length === 0) return true
  } else if (val instanceof Object) {
    val = (0, deepClone)(val)
    list.forEach(function (ele) {
      delete val[ele]
    })
    if (JSON.stringify(val) === '{}') return true
  } else {
    if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '') {
      return true
    }
    return false
  }
  return false
}
function handleImageAdded(file, Editor, cursorLocation, resetUploader) {
  // An example of using FormData
  // NOTE: Your key could be different such as:
  // formData.append('file', file)
  var formData = new FormData()
  formData.append('file', file)

  $http({
    url: '/sys/file/webupload/upload?uploadPath=/vueEditor',
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
    .then(result => {
      let url = result.data.url // Get url from response
      Editor.insertEmbed(cursorLocation, 'image', url)
      resetUploader()
    })
    .catch(err => {
      console.log(err)
    })
}
function hashCode(str) {
  var hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
/**
     * flexWidth
     * @param prop 每列的prop 可传''
     * @param tableData 表格数据
     * @param title 标题长内容短的，传标题  可不传
     * @param num 列中有标签等加的富余量
     * @returns 列的宽度
     * 注：prop,title有一个必传
*/
export function flexWidth(prop, tableData, title, num = 0) {
  if (tableData.length === 0) {
    //表格没数据不做处理
    return;
  }
  let flexWidth = 0; //初始化表格列宽
  let columnContent = ''; //占位最宽的内容
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  context.font = '14px Microsoft YaHei';
  if (prop === '' && title) {
    //标题长内容少的，取标题的值,
    columnContent = title;
  } else {
    // 获取该列中占位最宽的内容
    let index = 0;
    for (let i = 0; i < tableData.length; i++) {
      const now_temp = tableData[i][prop] + '';
      const max_temp = tableData[index][prop] + '';
      const now_temp_w = context.measureText(now_temp).width;
      const max_temp_w = context.measureText(max_temp).width;
      if (now_temp_w > max_temp_w) {
        index = i;
      }
    }
    columnContent = tableData[index][prop];
    //比较占位最宽的值跟标题、标题为空的留出四个位置
    const column_w = context.measureText(columnContent).width;
    const title_w = context.measureText(title).width;
    if (column_w < title_w) {
      columnContent = title || '留四个字';
    }
  }
  // 计算最宽内容的列宽
  let width = context.measureText(columnContent);
  flexWidth = width.width + 40 + num;
  return flexWidth + 'px';
}
export default { escapeHTML, hashCode, unescapeHTML, handleImageAdded, download, recover, recoverNotNull, hasPermission, treeDataTranslate, printLogo, deepClone, validatenull, flexWidth }
