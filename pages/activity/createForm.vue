<template lang="pug">
.box
  b-table(:tableValue="tableValue", @actionBtnClick="tableSearchBtns", @rowEdit="tableRowEdit", @pageChange="bottomPgChange", :currentPage="currentPage", :total="total", :rightPart="false")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      total: 0,
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
            lbl: '名称',
            prop: 'name'
          },
          {
            lbl: '手机',
            prop: 'phone'
          },
          {
            lbl: '行业',
            prop: 'job'
          },
          {
            lbl: '创建者',
            type: 'object',
            factValue(row) {
              return row.creator.nickname
            }
          },
          {
            lbl: '创建时间',
            type: 'datetime',
            prop: 'createAt'
          }
        ],
        tableData: []
      },
      currentPage: 1,
      searchName: '',
      exportData: []
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
    topSearchValue(val) {
      if (val.length > 0) {
        this.searchName = val
      } else {
        this.searchName = ''
      }
      this.currentPage = 1
      this.loadData()
    },
    tableSearchBtns(type) {
      if (type === 'excel') {
        const theader = ['姓名', '手机号', '行业', '创建时间']
        const thkeys = ['name', 'phone', 'job', 'createAt']
        this.excelData(theader, thkeys)
      }
    },
    async excelData(theader, thkeys) {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          this.apiList.activityFormExcel,
          'get',
          {
            bucket: this.currentUser.currentBucket.id
          }
        )
        this.pageHide(this)
        console.log(data)
        if (data.return_code === 0) {
          const edata = this.excelDataFormat(thkeys, data.list, ['createAt'])
          this.excelExport(theader, edata)
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.error(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    tableRowEdit(idx, obj, type) {
      this.formObj = {
        id: obj.id,
        name: obj.name
      }
      if (obj.iconImg && obj.iconImg.id > 0) this.classifyImg = obj.iconImg
      this.dialogVisible = true
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
          this.apiList.activityForm,
          'get',
          body
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
