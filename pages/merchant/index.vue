<template lang="pug">
.box
  b-table(:tableValue="tableValue", @rowEdit="tableRowEdit", :rightPart="false", @actionBtnClick="actionBtns")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  components: {},
  data() {
    return {
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'create'
          },
          {
            lbl: '批量启用',
            type: 'batchStart'
          },
          {
            lbl: '批量禁用',
            type: 'batchStop'
          }
        ],
        hasCbx: true,
        tableHead: [
          {
            lbl: '登录名称',
            type: 'object',
            factValue(row) {
              return row.acct.username
            }
          },
          {
            lbl: '商户名称',
            prop: 'name'
          },
          {
            lbl: '商户地址',
            prop: 'addr'
          },
          {
            lbl: '开店时间',
            prop: 'setUp',
            type: 'date'
          },
          {
            lbl: '服务电话',
            prop: 'servicePhone'
          },
          {
            lbl: '服务微信',
            prop: 'wxNo'
          },
          {
            lbl: '启用状态',
            type: 'object',
            factValue(row) {
              return row.acct.status === 0 ? '禁用' : '启用'
            }
          },
          {
            type: 'action',
            actionBtns: [
              {
                lbl: '编辑',
                type: 'edit'
              }
            ]
          }
        ],
        tableData: []
      },
      currentPage: 0
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
      if (type === 'create') {
        this.jump({ path: '/merchant/form?type=new' })
      }
    },
    tableRowEdit(idx, row, type) {
      console.log(type)
      if (type === 'edit')
        this.jump({ path: '/merchant/form?type=edit&id=' + row.id })
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
          this.apiList.merchant,
          'get',
          body
        )
        this.pageHide(this)
        if (data.return_code === 0 && data.list.length > 0) {
          this.tableValue.tableData = data.list
        } else {
          this.tableValue.tableData = []
          this.currentPage--
          if (this.currentPage < 0) this.currentPage = 0
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
        this.msgShow(e.message || '网络异常')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
