<template lang="pug">
.box 
  b-table(:tableValue="tableValue", @rowEdit="tableRowEdit", :rightPart="false", @actionBtnClick="actionBtns", :total="total", @chooseData="chooseItems")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
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
          },
          {
            lbl: '访问量',
            prop: 'pv'
          },
          {
            lbl: '购买量',
            prop: 'uv'
          },
          {
            lbl: '启用状态',
            type: 'object',
            factValue(row) {
              if (row.status === 0) {
                return '待上架'
              } else if (row.status === 1) {
                return '已上架'
              } else {
                return '已下架'
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
                lbl: '详情',
                type: 'info'
              }
            ]
          }
        ],
        tableData: []
      },
      currentPage: 0,
      total: 0,
      chooseProducts: []
    }
  },
  computed: {
    ...mapState({
      pageSize: state => state.pageSize
    })
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    chooseItems(val) {
      console.log('items:>>', val)
      this.chooseProducts = val
    },
    actionBtns(type) {
      if (type === 'create') {
        this.jump({ path: '/product/form?type=new' })
      } else if (type === 'batchUp' || type === 'batchDown') {
        console.log(type)
        if (this.chooseProducts.length === 0) {
          this.msgShow(this, '请选择要操作的行')
        } else {
          let action = type == 'batchUp' ? 1 : 2
          this.batchUpdate(action)
        }
      }
    },
    async batchUpdate(mark) {
      try {
        let ids = this.chooseProducts.map(itm => itm.id).join(',')
        let { data } = await this.proxy(
          this,
          this.apiList.productBatchStatus,
          'put',
          {
            mark,
            ids
          }
        )
        if (data.return_code === 0) {
          this.msgShow(this, '操作成功', 'success')
          this.currentPage = 0
          this.loadData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    tableRowEdit(idx, row, type) {
      if (type === 'edit') {
        if (row.status === 1) {
          this.msgShow(this, '上架的商品无法修改')
          return
        }
        this.jump({ path: '/product/form?type=edit&id=' + row.id })
      } else if (type == 'info') {
        this.jump({ path: '/product/detail?id=' + row.id })
      }
    },
    async loadData() {
      try {
        let body = {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        }
        let { data } = await this.proxy(this, this.apiList.product, 'get', body)
        if (data.list.length > 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
        } else {
          if (data.return_code != 0) this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
