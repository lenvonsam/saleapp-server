<template lang="pug">
.box
  b-table(:tableValue="tableValue", :rightPart="false", :total="total", @pageChange="bottomPgChange", :currentPage="currentPage")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      tableValue: {
        hasCbx: false,
        tableHead: [
          {
            lbl: '用户头像',
            prop: 'avatarUrl',
            type: 'image',
            factValue(url) {
              return url
            }
          },
          {
            lbl: '用户昵称',
            prop: 'nickname'
          },
          {
            lbl: '真实姓名',
            prop: 'realName'
          },
          {
            lbl: '地区',
            type: 'object',
            factValue(row) {
              return row.province + ' ' + row.city
            }
          },
          {
            lbl: '手机号',
            prop: 'phone'
          },
          {
            lbl: '性别',
            prop: 'sex',
            type: 'object',
            factValue(row) {
              return row.sex == 1 ? '男' : '女'
            }
          },
          {
            lbl: '账户余额',
            prop: 'balance'
          }
        ],
        tableData: []
      },
      currentPage: 1,
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
    bottomPgChange(val) {
      this.currentPage = val
      this.loadData()
    },
    async loadData() {
      try {
        this.pageShow(this)
        let body = {
          currentPage: this.currentPage - 1,
          pageSize: this.pageSize,
          bid: this.currentUser.currentBucket.id
        }
        let { data } = await this.proxy(
          this,
          this.apiList.accountUsers,
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
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
