<template lang="pug">
.box
  .bg-white
    el-tabs(v-model="activeName" type="card")
      el-tab-pane(label="用户提现", name="user")
        .padding.pt-0
          div
            el-button(size="small", @click="topBtnHandler('excel')") 全部导出
          el-tag.mt-15 待处理
          b-table.mt-15(:tableValue="userTableValue", @rowEdit="tableRowEdit", :rightPart="false",  :total="userTotal", @actionBtnClick="topBtnHandler", :currentPage="userCurrentPage", @pageChange="userPgChange")
          el-tag.mt-15 已处理
          b-table.mt-15(:tableValue="userdTableValue", :rightPart="false",  :total="userdTotal", :currentPage="userdCurrentPage", @pageChange="userdPgChange")
      el-tab-pane(label="商户提现", name="merchant")
        .padding.pt-0
          div
            el-button(size="small", @click="topBtnHandler('excel')") 全部导出
          el-tag.mt-15 待处理
          b-table.mt-15(:tableValue="merchantTableValue", @rowEdit="tableRowEdit", :rightPart="false",  :total="merchantTotal", @actionBtnClick="topBtnHandler", :currentPage="merchantCurrentPage", @pageChange="merchantPgChange")
          el-tag.mt-15 已处理
          b-table.mt-15(:tableValue="merchantdTableValue", @rowEdit="tableRowEdit", :rightPart="false",  :total="merchantdTotal", :currentPage="merchantdCurrentPage", @pageChange="merchantdPgChange")


</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      activeName: 'user',
      userTotal: 0,
      userCurrentPage: 1,
      userTableValue: {
        hasCbx: true,
        // actions: [
        //   {
        //     lbl: '数据导出',
        //     type: 'excel'
        //   }
        // ],
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
            lbl: '申请时间',
            type: 'datetime',
            prop: 'withdrawApplyTime'
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                lbl: '微信零钱包',
                type: 'wx'
              },
              // {
              //   lbl: '银行转账',
              //   type: 'bankOnline'
              // },
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
        // actions: [
        //   {
        //     lbl: '数据导出',
        //     type: 'excel'
        //   }
        // ],
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
            lbl: '申请时间',
            type: 'datetime',
            prop: 'withdrawApplyTime'
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              // {
              //   lbl: '微信零钱包',
              //   type: 'wx'
              // },
              // {
              //   lbl: '线上转账',
              //   type: 'bankOnline'
              // },
              {
                lbl: '线下打款',
                type: 'bankOffline'
              }
            ]
          }
        ],
        tableData: []
      },
      merchantCurrentPage: 1,
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
            lbl: '打款时间',
            type: 'datetime',
            prop: 'withdrawHandleTime'
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
      userdCurrentPage: 1,
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
            lbl: '打款时间',
            type: 'datetime',
            prop: 'withdrawHandleTime'
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
      merchantdCurrentPage: 1
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
        this.userCurrentPage = 1
        this.loadUserData()
        this.userdCurrentPage = 1
        this.loadUserStatusData()
      } else {
        this.merchantCurrentPage = 1
        this.loadMerchantData()
        this.merchantdCurrentPage = 1
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
    userPgChange(val) {
      this.userCurrentPage = val
      this.loadUserData()
    },
    userdPgChange(val) {
      this.userdCurrentPage = val
      this.loadUserStatusData()
    },
    merchantPgChange(val) {
      this.merchantCurrentPage = val
      this.loadMerchantData()
    },
    merchantdPgChange(val) {
      this.merchantdCurrentPage = val
      this.loadMerchantStatusData()
    },
    topBtnHandler(type) {
      if (type === 'excel') {
        let theader = []
        let thkeys = []
        if (this.activeName === 'user') {
          theader = [
            '用户昵称',
            '真实姓名',
            '手机号',
            '账户余额',
            '提现金额',
            '打款类型',
            '开户行',
            '开户名称',
            '银行卡号',
            '申请时间',
            '打款时间',
            '提现状态'
          ]
          thkeys = [
            'unickname',
            'urealName',
            'uphone',
            'ubalance',
            'amount',
            'withdrawType',
            'bankName',
            'bankAcct',
            'bankNo',
            'withdrawApplyTime',
            'withdrawHandleTime',
            'withdrawStatus'
          ]
        } else {
          theader = [
            '商户名称',
            '商户地址',
            '商户余额',
            '提现金额',
            '打款方式',
            '开户行',
            '开户名称',
            '银行卡号',
            '申请时间',
            '打款时间',
            '提现状态'
          ]
          thkeys = [
            'mname',
            'maddr',
            'ubalance',
            'amount',
            'withdrawType',
            'bankName',
            'bankAcct',
            'bankNo',
            'withdrawApplyTime',
            'withdrawHandleTime',
            'withdrawStatus'
          ]
        }
        this.pageShow(this)
        this.callAcctWithdrawList(theader, thkeys)
      }
    },
    async callAcctWithdrawList(theader, thkeys) {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.accountWithdrawExcel,
          'get',
          {
            bid: this.currentUser.currentBucket.id,
            type: this.activeName === 'user' ? 0 : 1
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          const edata = this.excelDataFormat(thkeys, data.list, [
            'withdrawApplyTime',
            'withdrawHandleTime'
          ])
          this.excelExport(theader, edata)
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '获取导出数据失败')
      }
    },
    tableRowEdit(idx, obj, type) {
      console.log('type :>>', type)
      // this.formObj = Object.assign({}, obj)
      // this.dialogVisible = true
      const me = this
      if (type === 'bankOnline') {
        this.msgShow(this, '正在努力开发中...', 'warning')
      } else if (type === 'wx') {
        this.confirmDialog(this, '请确认要给该账户微信零钱包，一旦确认无法更改')
          .then(() => {
            console.log('confirm')
            me.callWxTrans(obj)
          })
          .catch(() => {})
      } else if (type === 'bankOffline') {
        this.confirmDialog(this, '请仔细核对相关信息，一点确认将无法更改')
          .then(() => {
            me.changeTransType(obj.id, 4)
          })
          .catch(() => {})
      }
    },
    // 微信零钱
    async callWxTrans(obj) {
      try {
        this.pageShow(this)
        let url = this.apiList.accountWithdrawTrans.replace('$', obj.acct.id)
        let { data } = await this.proxy(this, url, 'put', {
          bid: this.currentUser.currentBucket.id,
          recordId: obj.id
        })
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(this, '微信零钱转账成功', 'success')
          this.userCurrentPage = 1
          this.loadUserData()
          this.userdCurrentPage = 1
          this.loadUserStatusData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.error(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
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
            this.userCurrentPage = 1
            this.loadUserData()
            this.userdCurrentPage = 1
            this.loadUserStatusData()
          } else {
            this.merchantCurrentPage = 1
            this.loadMerchantData()
            this.merchantdCurrentPage = 1
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
            currentPage: this.userCurrentPage - 1,
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
            currentPage: this.userdCurrentPage - 1,
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
            currentPage: this.merchantCurrentPage - 1,
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
            currentPage: this.merchantdCurrentPage - 1,
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
