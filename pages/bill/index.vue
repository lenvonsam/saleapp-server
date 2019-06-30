<template lang="pug">
.box 
  .padding.bg-white.border
    .row.text-center.flex-center
      .col.pr-10
        div
          el-input(placeholder="订单编号", v-model="orderNo")
        .mt-10
          el-input(placeholder="商品名称", v-model="productName")
      .col.pr-10
        div
          el-select.full-width(placeholder="订单状态", v-model="billStatus")
            el-option(label="全部", value="-1")
            el-option(label="待支付", value="0")
            el-option(label="待核销", value="1")
            //- el-option(label="待发货", value="7")
            //- el-option(label="已发货", value="8")
            el-option(label="已完成", value="2")
        .mt-10
          el-date-picker.full-width(v-model="startDate" type="date", placeholder="开始时间", value-format="yyyy-MM-dd")
      .col.pr-10
        div
          el-input(placeholder="手机号", v-model="phone")
        .mt-10
          el-date-picker.full-width(v-model="endDate" type="date", placeholder="结束时间", value-format="yyyy-MM-dd")
      .flex-180.text-center
        el-button(size="medium", @click="resetSearch") 重置
        el-button(type="primary", size="medium", @click="loadData") 搜索
  b-table.mt-15(:tableValue="tableValue", :rightPart="false", @actionBtnClick="actionBtns", :total="total", @pageChange="pgChange")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      billStatus: '-1',
      orderNo: '',
      phone: '',
      productName: '',
      startDate: '',
      endDate: '',
      tableValue: {
        actions: [
          {
            lbl: '数据导出',
            type: 'excel'
          }
        ],
        hasCbx: false,
        tableHead: [
          {
            lbl: '订单编号',
            prop: 'orderNo'
          },
          {
            lbl: '商品名称',
            prop: 'productTitle'
          },
          {
            lbl: '商品图片',
            prop: 'productUrl',
            type: 'image',
            factValue(url) {
              return url
            }
          },
          {
            lbl: '订单金额',
            prop: 'productPrice'
          },
          {
            lbl: '购买者',
            prop: 'buyerName'
          },
          {
            lbl: '联系电话',
            prop: 'buyerPhone'
          },
          {
            lbl: '下单时间',
            prop: 'createAt',
            type: 'datetime'
          },
          {
            lbl: '订单状态',
            prop: 'status',
            type: 'object',
            factValue(row) {
              if (row.status === 0) {
                return '待支付'
              } else if (row.status === 1) {
                return '待核销'
              } else if (row.status === 7) {
                return '待发货'
              } else if (row.status === 8) {
                return '已发货'
              } else {
                return '已完成'
              }
            }
          },
          {
            lbl: '所属商户',
            prop: 'product',
            type: 'object',
            factValue(row) {
              return row.product.merchant.name
            }
          },
          {
            lbl: '是否赠好友',
            prop: 'canGiven',
            type: 'object',
            factValue(row) {
              return row.canGiven ? '是' : '否'
            }
          },
          {
            lbl: '好友姓名',
            prop: 'givenName'
          },
          {
            lbl: '好友电话',
            prop: 'givenPhone'
          }
        ],
        tableData: []
      },
      currentPage: 0,
      total: 0
    }
  },
  computed: {
    ...mapState({
      pageSize: state => state.pageSize,
      currentUser: state => state.user.currentUser
    })
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    actionBtns(type) {
      if (type === 'excel') {
        let theader = [
          '订单编号',
          '商品名称',
          '订单金额',
          '购买者',
          '联系电话',
          '下单时间',
          '订单状态',
          '所属商户',
          '是否赠好友',
          '好友姓名',
          '好友电话'
        ]
        let thkeys = [
          'orderNo',
          'productTitle',
          'productPrice',
          'buyerName',
          'buyerPhone',
          'createAt',
          'billStatus',
          'billMerchant',
          'canGiven',
          'givenName',
          'givenPhone'
        ]
        this.pageShow(this)
        this.callExcelList(theader, thkeys)
      }
    },
    async callExcelList(theader, thkeys) {
      try {
        var body = {
          bid: this.currentUser.currentBucket.id
        }
        if (this.orderNo.toString().trim().length > 0)
          body.orderNo = this.orderNo.trim()
        if (Number(this.billStatus) > -1) body.status = Number(this.billStatus)
        if (this.phone.toString().trim().length > 0)
          body.phoneNo = this.phone.trim()
        if (this.productName.toString().trim().length > 0)
          body.productName = this.productName
        if (this.startDate.length > 0) body.startDate = this.startDate
        if (this.endDate.length > 0) body.endDate = this.endDate
        let { data } = await this.proxy(
          this,
          this.apiList.billExcel,
          'get',
          body
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          const edata = this.excelDataFormat(thkeys, data.list, ['createAt'])
          this.excelExport(theader, edata)
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    resetSearch() {
      ;(this.billStatus = '-1'), (this.orderNo = '')
      this.phone = ''
      this.productName = ''
      this.startDate = ''
      this.endDate = ''
      // this.currentPage = 0
      // // this.loadData()
    },
    pgChange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    async loadData() {
      try {
        this.pageShow(this)
        var body = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          bid: this.currentUser.currentBucket.id
        }
        if (this.orderNo.toString().trim().length > 0)
          body.orderNo = this.orderNo.trim()
        if (Number(this.billStatus) > -1) body.status = Number(this.billStatus)
        if (this.phone.toString().trim().length > 0)
          body.phoneNo = this.phone.trim()
        if (this.productName.toString().trim().length > 0)
          body.productName = this.productName
        if (this.startDate.length > 0) body.startDate = this.startDate
        if (this.endDate.length > 0) body.endDate = this.endDate
        let { data } = await this.proxy(this, this.apiList.bill, 'get', body)
        this.pageHide(this)
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
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
