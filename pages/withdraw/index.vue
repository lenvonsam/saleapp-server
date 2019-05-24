<template lang="pug">
.box
  .bg-white
    el-tabs(v-model="activeName" type="card")
      el-tab-pane(label="用户提现", name="user")
        .padding
          el-tag 待处理
          b-table.mt-15(:tableValue="userTableValue", @rowEdit="tableRowEdit", :rightPart="false",  :total="userTotal")
          el-tag.mt-15 已处理
          b-table.mt-15(:tableValue="userdTableValue", :rightPart="false",  :total="userdTotal")
      el-tab-pane(label="商户提现", name="merchant")
        .padding
          el-tag 待处理
          b-table.mt-15(:tableValue="merchantTableValue", @rowEdit="tableRowEdit", :rightPart="false",  :total="merchantTotal")
          el-tag.mt-15 已处理
          b-table.mt-15(:tableValue="merchantdTableValue", @rowEdit="tableRowEdit", :rightPart="false",  :total="merchantdTotal")


</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      activeName: 'user',
      userTotal: 0,
      userCurrentPage: 0,
      userTableValue: {
        hasCbx: true,
        tableHead: [
          {
            lbl: '用户昵称',
            prop: 'nickname',
            type: 'object',
            factValue(row) {
              return row.acct.nickname
            }
          },
          {
            lbl: '真实姓名',
            prop: 'realName',
            type: 'object',
            factValue(row) {
              return row.acct.realName
            }
          },
          {
            lbl: '手机号',
            prop: 'phone',
            type: 'object',
            factValue(row) {
              return row.acct.phone
            }
          },
          {
            lbl: '账户余额',
            prop: 'balance',
            type: 'object',
            factValue(row) {
              return row.acct.balance
            }
          },
          {
            lbl: '提现金额',
            prop: 'amount'
          },
          {
            lbl: '打款类型',
            prop: 'withdrawType',
            type: 'object',
            factValue(row) {
              return row.withdrawType === 0 ? '微信钱包' : '银行打款'
            }
          },
          {
            lbl: '开户行',
            prop: 'bankName'
          },
          {
            lbl: '开户名称',
            prop: 'bankAcct'
          },
          {
            lbl: '银行卡号',
            prop: 'bankNo'
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                lbl: '微信零钱包',
                type: 'wx'
              },
              {
                lbl: '银行转账',
                type: 'bankOnline'
              },
              {
                lbl: '线下打款',
                type: 'bankOffline'
              }
            ]
          }
        ],
        tableData: []
      },
      merchantTableValue: {
        hasCbx: true,
        tableHead: [
          {
            lbl: '商户名称',
            prop: 'name',
            type: 'object',
            factValue(row) {
              return row.merchant.name
            }
          },
          {
            lbl: '商户地址',
            type: 'object',
            factValue(row) {
              return row.merchant.addr
            }
          },
          {
            lbl: '商户余额',
            type: 'object',
            factValue(row) {
              return row.acct.balance
            }
          },
          {
            lbl: '提现金额',
            prop: 'amount'
          },
          {
            lbl: '打款方式',
            type: 'object',
            factValue(row) {
              return row.withdrawType === 0 ? '微信钱包' : '银行打款'
            }
          },
          {
            lbl: '开户行',
            prop: 'bankName'
          },
          {
            lbl: '开户名称',
            prop: 'bankAcct'
          },
          {
            lbl: '银行卡号',
            prop: 'bankNo'
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                lbl: '微信零钱包',
                type: 'wx'
              },
              {
                lbl: '线上转账',
                type: 'bankOnline'
              },
              {
                lbl: '线下打款',
                type: 'bankOffline'
              }
            ]
          }
        ],
        tableData: []
      },
      merchantCurrentPage: 0,
      merchantTotal: 0,
      userdTableValue: {
        hasCbx: true,
        tableHead: [
          {
            lbl: '用户昵称',
            prop: 'nickname',
            type: 'object',
            factValue(row) {
              return row.acct.nickname
            }
          },
          {
            lbl: '真实姓名',
            prop: 'realName',
            type: 'object',
            factValue(row) {
              return row.acct.realName
            }
          },
          {
            lbl: '手机号',
            prop: 'phone',
            type: 'object',
            factValue(row) {
              return row.acct.phone
            }
          },
          {
            lbl: '账户余额',
            prop: 'balance',
            type: 'object',
            factValue(row) {
              return row.acct.balance
            }
          },
          {
            lbl: '提现金额',
            prop: 'amount'
          },
          {
            lbl: '打款类型',
            prop: 'withdrawType',
            type: 'object',
            factValue(row) {
              return row.withdrawType === 0 ? '微信钱包' : '银行打款'
            }
          },
          {
            lbl: '开户行',
            prop: 'bankName'
          },
          {
            lbl: '开户名称',
            prop: 'bankAcct'
          },
          {
            lbl: '银行卡号',
            prop: 'bankNo'
          },
          {
            lbl: '状态',
            type: 'object',
            factValue(row) {
              if (row.status === 2) return '微信零钱包'
              else if (row.status === 3) return '线上转账'
              else return '线下打款'
            }
          }
        ],
        tableData: []
      },
      userdTotal: 0,
      userdCurrentPage: 0,
      merchantdTableValue: {
        hasCbx: false,
        tableHead: [
          {
            lbl: '商户名称',
            prop: 'name',
            type: 'object',
            factValue(row) {
              return row.merchant.name
            }
          },
          {
            lbl: '商户地址',
            type: 'object',
            factValue(row) {
              return row.merchant.addr
            }
          },
          {
            lbl: '商户余额',
            type: 'object',
            factValue(row) {
              return row.acct.balance
            }
          },
          {
            lbl: '提现金额',
            prop: 'amount'
          },
          {
            lbl: '打款方式',
            type: 'object',
            factValue(row) {
              return row.withdrawType === 0 ? '微信钱包' : '银行打款'
            }
          },
          {
            lbl: '开户行',
            prop: 'bankName'
          },
          {
            lbl: '开户名称',
            prop: 'bankAcct'
          },
          {
            lbl: '银行卡号',
            prop: 'bankNo'
          },
          {
            lbl: '状态',
            type: 'object',
            factValue(row) {
              if (row.status === 2) return '微信零钱包'
              else if (row.status === 3) return '线上转账'
              else return '线下打款'
            }
          }
        ],
        tableData: []
      },
      merchantdTotal: 0,
      merchantdCurrentPage: 0
    }
  },
  computed: {
    ...mapState({
      pageSize: state => state.pageSize,
      currentUser: state => state.user.currentUser
    })
  },
  watch: {
    activeName(newVal, oldVal) {
      if (newVal === 'user') {
        this.userCurrentPage = 0
        this.loadUserData()
        this.userdCurrentPage = 0
        this.loadUserStatusData()
      } else {
        this.merchantCurrentPage = 0
        this.loadMerchantData()
        this.merchantdCurrentPage = 0
        this.loadMerchantStatusData()
      }
    }
  },
  beforeMount() {
    if (this.activeName === 'user') {
      this.loadUserData()
      this.loadUserStatusData()
    }
  },
  methods: {
    tableRowEdit(idx, obj, type) {
      console.log('type :>>', type)
      // this.formObj = Object.assign({}, obj)
      // this.dialogVisible = true
      if (type === 'wx' || type === 'bankOnline') {
        this.msgShow(this, '正在努力开发中...', 'warning')
      } else if (type === 'bankOffline') {
        const me = this
        this.confirmDialog(this, '请仔细核对相关信息，一点确认将无法更改')
          .then(() => {
            me.changeTransType(obj.id, 4)
          })
          .catch(() => {})
      }
    },
    async changeTransType(id, type) {
      try {
        this.pageShow(this)
        let url = this.apiList.accountTrans.replace('$', id)
        let { data } = await this.proxy(this, url, 'put', {
          type: type
        })
        this.pageHide(this)
        if (data.return_code === 0) {
          if (this.activeName === 'user') {
            this.userCurrentPage = 0
            this.loadUserData()
            this.userCurrentPage = 0
            this.loadUserStatusData()
          } else {
            this.merchantCurrentPage = 0
            this.loadMerchantData()
            this.merchantdCurrentPage = 0
            this.loadMerchantStatusData()
          }
          this.msgShow(this, '操作成功', 'success')
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadUserData() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          this.apiList.accountWithdraw,
          'get',
          {
            currentPage: this.userCurrentPage,
            pageSize: this.pageSize,
            bid: this.currentUser.currentBucket.id,
            type: 0
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.userTableValue.tableData = data.list
          this.userTotal = data.total
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadUserStatusData() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          this.apiList.accountWithdrawStatus,
          'get',
          {
            currentPage: this.userdCurrentPage,
            pageSize: this.pageSize,
            bid: this.currentUser.currentBucket.id,
            type: 0
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.userdTableValue.tableData = data.list
          this.userdTotal = data.total
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadMerchantData() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          this.apiList.accountWithdraw,
          'get',
          {
            currentPage: this.merchantCurrentPage,
            pageSize: this.pageSize,
            bid: this.currentUser.currentBucket.id,
            type: 1
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.merchantTableValue.tableData = data.list
          this.merchantTotal = data.total
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadMerchantStatusData() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          this.apiList.accountWithdrawStatus,
          'get',
          {
            currentPage: this.merchantdCurrentPage,
            pageSize: this.pageSize,
            bid: this.currentUser.currentBucket.id,
            type: 1
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.merchantdTableValue.tableData = data.list
          this.merchantdTotal = data.total
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
