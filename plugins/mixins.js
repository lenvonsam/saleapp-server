import Vue from 'vue'
import elementUtil from '../utils/elemtUtil'
import apiList from '../utils/apiList'
const APILIST = apiList.api()

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const minixs = {
  data() {
    return {
      apiList: APILIST
    }
  },
  watch: {
    '$store.state.globalSuccessMsg'(newVal, oldVal) {
      if (newVal !== '') this.msgShow(this, newVal, 'success')
    },
    '$store.state.globalErrorMsg'(newVal, oldVal) {
      if (newVal !== '') this.msgShow(this, newVal)
    }
  },
  methods: {
    jump(to) {
      if (this.$router) this.$router.push(to)
    },
    back() {
      if (this.$router) this.$router.go(-1)
    },
    date2Str(date) {
      if (date) {
        var n = date
        if (typeof date === 'number') {
          n = new Date(date)
        }
        let years = n.getFullYear()
        let month = n.getMonth() + 1
        let day = n.getDate()
        return [years, month, day].map(formatNumber).join('-')
      } else {
        return ''
      }
    },
    date2Time(date) {
      if (date) {
        var n = date
        if (typeof date === 'number') {
          n = new Date(date)
        }
        let years = n.getFullYear()
        let month = n.getMonth() + 1
        let day = n.getDate()
        let hours = n.getHours()
        let mins = n.getMinutes()
        let secs = n.getSeconds()
        return (
          [years, month, day].map(formatNumber).join('-') +
          ' ' +
          [hours, mins, secs].map(formatNumber).join(':')
        )
      } else {
        return ''
      }
    },
    One2DArray(originArray, len = 3, autoComplete = true) {
      let row =
        originArray.length % len == 0
          ? originArray.length / len
          : Math.ceil(originArray.length / len)
      let arr = []
      for (var i = 0; i < row; i++) {
        if (i == row - 1 && i * len < originArray.length - 1) {
          // 最后一行
          let tempArr = []
          let startIdx = i * len
          for (var j = startIdx; j < originArray.length; j++) {
            tempArr.push(originArray[j])
          }
          if (autoComplete) {
            for (var x = 0; x < len - tempArr.length; x++) {
              tempArr.push('')
            }
          }
          arr.push(tempArr)
        } else {
          arr.push([
            originArray[i * len],
            originArray[i * len + 1],
            originArray[i * len + 2]
          ])
        }
      }
      return arr
    },
    request(ctx, config) {
      return ctx.$axios({
        method: 'post',
        url: 'http://' + window.location.host + config.url,
        data: config.params
      })
    },
    proxy(ctx, url, method = 'get', params = {}) {
      return this.request(ctx, {
        url: '/proxy',
        params: {
          method,
          url,
          params
        }
      })
    },
    formValidate(ctx, formName) {
      return new Promise((resolve, reject) => {
        ctx.$refs[formName].validate(valid => {
          if (valid) {
            resolve('success')
          } else {
            reject(new Error('valid fail'))
            return
          }
        })
      })
    },
    pageShow: elementUtil.pageShow,
    pageHide: elementUtil.pageHide,
    msgShow: elementUtil.msgShow,
    confirmDialog: elementUtil.confirmDialog,
    // excel 数据导出
    excelExport(thead, tdata, tname = 'excel_template') {
      require.ensure([], () => {
        const {
          export_json_to_excel
        } = require('../utils/excelExport/Export2Excel')
        export_json_to_excel(thead, tdata, tname)
      })
    },
    excelDataFormat(keys, values, timekeys = []) {
      return values.map(v =>
        keys.map(k => {
          if (timekeys.length === 0) {
            return v[k]
          } else {
            let idx = timekeys.findIndex(t => t === k)
            if (idx >= 0) {
              return this.date2Time(v[k])
            } else {
              return v[k]
            }
          }
        })
      )
    }
  }
}
Vue.mixin(minixs)
