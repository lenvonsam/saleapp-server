<template lang="pug">
.box  
  el-tag 普通活动
  b-table.mt-15(:tableValue="tableValue", @actionBtnClick="tableSearchBtns", @rowEdit="tableRowEdit", :rightPart="false", :total="total")
  el-tag.mt-15 推荐活动
  b-table.mt-15(:tableValue="actValue", :rightPart="false", @rowEdit="tableRowEdit")
  el-tag.mt-15 推荐商品
  b-table.mt-15(:tableValue="prdValue", :rightPart="false", @rowEdit="tableRowEdit")
  el-dialog(:visible.sync="dialogShow")
    template(v-if="rowType == 'preview'")
      .modal-preview(v-html="currentObj.strategy", v-if="currentObj.strategy && currentObj.strategy.length > 0") 123
      .padding.text-center(v-else) 暂无攻略
    template(v-else-if="rowType == 'addProduct'")
      el-form
        el-form-item(label="商品名称")
          el-select(v-model="dropdownVal", placeholder="请输入商品名称", filterable, multiple, remote, :remote-method="remoteProducts", style="width: 80%")
            el-option(v-for="p in productArray", :key="p.id", :label="p.title", :value="p.id")
    template(v-else-if="rowType == 'products'")
      b-table(:tableValue="activityProducts", :rightPart="false")
    div(slot="footer")
      el-button(@click="dialogShow = false") 取消
      el-button(type="primary", @click="dialogConfirm") 确定
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
      dialogShow: false,
      rowType: '',
      currentObj: '',
      productArray: [],
      dropdownVal: [],
      activityProducts: {
        hasCbx: false,
        footerHide: true,
        tableHead: [
          {
            lbl: '封面图',
            type: 'image',
            prop: 'coverImages',
            factValue(row) {
              return row.url
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
        let ids = this.dropdownVal.join(',')
        let { data } = await this.proxy(
          this,
          this.apiList.activityAddProduct,
          'post',
          {
            pids: ids,
            id: this.currentObj.id
          }
        )
        if (data.return_code === 0) {
          this.currentPage = 0
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
    },
    async loadData() {
      try {
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
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
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
