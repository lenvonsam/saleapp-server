<template lang="pug">
.box  
  el-tag 普通活动
  b-table.mt-15(:tableValue="tableValue", @actionBtnClick="tableSearchBtns", @rowEdit="tableRowEdit", :rightPart="false", :total="total", @chooseData="rowSelection")
  el-tag.mt-15 推荐活动
  b-table.mt-15(:tableValue="actValue", :rightPart="false", @rowEdit="tableRowEdit")
  el-tag.mt-15 推荐商品
  b-table.mt-15(:tableValue="prdValue", :rightPart="false", @rowEdit="tableRowEdit")
  el-dialog(:visible.sync="dialogShow")
    template(v-if="rowType == 'preview'")
      .modal-preview(v-html="currentObj.strategy", v-if="currentObj.strategy && currentObj.strategy.length > 0")
      .padding.text-center(v-else) 暂无攻略
    template(v-else-if="rowType == 'addProduct'")
      el-form
        el-form-item(label="商品名称")
          el-select(v-model="dropdownVal", placeholder="请输入商品名称", filterable, remote, :remote-method="remoteProducts", style="width: 80%")
            el-option(v-for="p in productArray", :key="p.id", :label="p.title", :value="p.id")
        el-form-item(label="限购数量")
          el-input-number(placeholder="请输入限购数量", v-model="productLimitCount", :step="1", :min="0")
    template(v-else-if="rowType == 'products'")
      b-table(:tableValue="activityProducts", :rightPart="false", @rowEdit="activityProductRowEdit")
    div(slot="footer")
      el-button(@click="dialogShow = false") 取消
      el-button(type="primary", @click="dialogConfirm") 确定
  el-dialog(:visible.sync="limitDialog")
    el-form
      el-form-item(label="请修改限购数量")
        el-input-number(v-model="editProductLimitCount", :step="1", :min="0")
    div(slot="footer")
      el-button(@click="limitDialog = false") 取消
      el-button(type="primary", @click="callUpdateActivityProductLimit") 确定
  </span>
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    const commonTHead = [
      {
        lbl: '活动名称',
        prop: 'name'
      },
      {
        lbl: '活动封面',
        prop: 'coverImg',
        type: 'image',
        factValue(obj) {
          return obj === null ? '' : obj.url
        }
      },
      {
        lbl: '开始时间',
        prop: 'startTime',
        type: 'date'
      },
      {
        lbl: '结束时间',
        prop: 'endTime',
        type: 'date'
      },
      {
        lbl: '状态',
        type: 'object',
        factValue(obj) {
          if (obj.status === 0) {
            return '待上架'
          } else if (obj.status === 1) {
            return '已上架'
          } else if (obj.status === 2) {
            return '已下架'
          } else {
            return '已过期'
          }
        }
      },
      {
        lbl: '所属大类',
        type: 'object',
        factValue(obj) {
          if (obj.classifies.length === 0) {
            return '无'
          } else {
            return obj.classifies.map(itm => itm.name).join(',')
          }
        }
      },
      {
        type: 'action',
        actionBtns: [
          {
            lbl: '编辑',
            type: 'edit'
          },
          {
            lbl: '预览攻略',
            type: 'preview'
          },
          {
            lbl: '查看商品',
            type: 'products'
          },
          {
            lbl: '添加商品',
            type: 'addProduct'
          }
        ]
      }
    ]
    return {
      // 商品活动限购数量
      productLimitCount: 0,
      limitDialog: false,
      pid: 0,
      editProductLimitCount: 0,
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'create'
          },
          {
            lbl: '批量上架',
            type: 'batchUp'
          },
          {
            lbl: '批量下架',
            type: 'batchDown'
          }
        ],
        hasCbx: true,
        tableHead: commonTHead,
        tableData: []
      },
      currentPage: 0,
      total: 0,
      chooseArr: [],
      dialogShow: false,
      rowType: '',
      currentObj: '',
      productArray: [],
      // dropdownVal: [],
      dropdownVal: '',
      activityProducts: {
        hasCbx: false,
        footerHide: true,
        tableHead: [
          {
            lbl: '封面图',
            type: 'image',
            // prop: 'coverImages',
            prop: 'coverUrl',
            factValue(row) {
              return row
            }
          },
          {
            lbl: '主标题',
            prop: 'title'
          },
          {
            lbl: '库存',
            prop: 'stock'
          },
          {
            lbl: '原价',
            prop: 'originPrice'
          },
          {
            lbl: '折扣价',
            prop: 'discountPrice'
          },
          {
            lbl: '限购数量',
            prop: 'limitCount'
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                lbl: '修改限量',
                type: 'editLimit'
              },
              {
                lbl: '移出活动',
                type: 'delete'
              }
            ]
          }
        ],
        tableData: []
      },
      actValue: {
        hasCbx: false,
        tableHead: commonTHead,
        tableData: [],
        footerHide: true
      },
      prdValue: {
        hasCbx: false,
        tableHead: commonTHead,
        tableData: [],
        footerHide: true
      }
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser,
      pageSize: state => state.pageSize
    })
  },
  beforeMount() {
    this.$nextTick(function() {
      this.loadData()
      this.loadActivityDetail(1)
      this.loadActivityDetail(2)
    })
  },
  methods: {
    rowSelection(val) {
      this.chooseArr = val
    },
    activityProductRowEdit(idx, row, type) {
      if (type === 'delete') {
        this.deleteActivityOneProduct(row.id)
      }
      if (type === 'editLimit') {
        this.editProductLimitCount = row.limitCount
        this.pid = row.id
        this.limitDialog = true
      }
    },
    async callUpdateActivityProductLimit() {
      try {
        this.pageShow(this)
        let url = this.apiList.activityProductLimitUpdate.replace(
          '$',
          this.currentObj.id
        )
        let { data } = await this.proxy(this, url, 'put', {
          pid: this.pid,
          count: this.editProductLimitCount
        })
        this.pageHide(this)
        this.limitDialog = false
        this.pid = 0
        this.editProductLimitCount = 0
        if (data.return_code === 0) {
          this.msgShow(this, '修改成功', 'success')
          this.callActivityProducts(this.currentObj.id)
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
        this.limitDialog = false
        this.editProductLimitCount = 0
        this.pid = 0
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async deleteActivityOneProduct(pid) {
      try {
        this.pageShow(this)
        const url = this.apiList.activityProductDel.replace(
          '$',
          this.currentObj.id
        )
        let { data } = await this.proxy(this, url, 'delete', { pid: pid })
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(this, '移除成功', 'success')
          this.callActivityProducts(this.currentObj.id)
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async remoteProducts(name) {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.productDropdown,
          'get',
          {
            currentPage: 0,
            pageSize: 10,
            acctId: this.currentUser.id,
            title: name
          }
        )
        if (data.return_code === 0) this.productArray = data.list
      } catch (e) {
        consoe.log(e)
      }
    },
    dialogConfirm() {
      this.dialogShow = false
      if (this.rowType === 'addProduct') {
        // 进行添加商品操作
        if (this.dropdownVal.length === 0) {
          this.msgShow(this, '请选择添加的商品')
          return
        }
        this.callAddProduct()
      }
    },
    async callActivityProducts(id) {
      try {
        let url = this.apiList.acitvityProducts.replace('$', id)
        let { data } = await this.proxy(this, url)
        if (data.return_code === 0) {
          this.activityProducts.tableData = data.arr
        } else {
          this.msgShow(this, data.message)
          this.activityProducts.tableData = []
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async callAddProduct() {
      try {
        // let ids = this.dropdownVal.join(',')
        console.log('xx:>>', this.dropdownVal)
        let ids = this.dropdownVal
        let { data } = await this.proxy(
          this,
          this.apiList.activityAddProduct,
          'post',
          {
            pids: ids,
            id: this.currentObj.id,
            count: this.productLimitCount,
            bid: this.currentUser.currentBucket.id
          }
        )
        if (data.return_code === 0) {
          this.currentPage = 0
          this.productLimitCount = 1
          this.dropdownVal = ''
          this.loadData()
          this.msgShow(this, '新增成功', 'success')
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    tableRowEdit(idx, row, type) {
      console.log('row type:>>', type)
      console.log('row:>>', row)
      this.rowType = type
      if (type === 'edit') {
        if (row.status === 1 && row.id > 2) {
          this.msgShow(this, '活动已上架无法修改')
          return
        }
        this.jump({ path: '/activity/form?type=edit&id=' + row.id })
      } else {
        this.currentObj = Object.assign({}, row)
        if (type === 'products') {
          this.callActivityProducts(row.id)
        }
        this.dialogShow = true
      }
    },
    tableSearchBtns(type) {
      if (type === 'create') {
        this.jump({ path: '/activity/form?type=new' })
      }
      if (type === 'batchUp' || type === 'batchDown') {
        console.log(type)
        if (this.chooseArr.length === 0) {
          this.msgShow(this, '请选择操作行')
          return
        }
        this.batchStatus(type === 'batchUp' ? 1 : 2)
      }
    },
    async batchStatus(status) {
      try {
        this.pageShow(this)
        let ids = this.chooseArr.map(itm => itm.id).join(',')
        let { data } = await this.proxy(
          this,
          this.apiList.activityBatchStatus,
          'put',
          {
            status: status,
            ids: ids
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.currentPage = 0
          this.loadData()
          this.msgShow(this, '操作成功', 'success')
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadData() {
      try {
        this.pageShow(this)
        let body = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          bid: this.currentUser.currentBucket.id
        }
        let { data } = await this.proxy(
          this,
          this.apiList.activity,
          'get',
          body
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadActivityDetail(type = 1) {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.activityDetail + type
        )
        if (data.return_code === 0) {
          type === 1
            ? (this.actValue.tableData = [data.obj])
            : (this.prdValue.tableData = [data.obj])
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
