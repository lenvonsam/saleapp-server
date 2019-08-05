<template lang="pug">
.box
  b-table(:tableValue="tableValue", @actionBtnClick="tableSearchBtns", @rowEdit="tableRowEdit", @rightTopSearch="topSearchValue", @pageChange="bottomPgChange", :currentPage="currentPage", :total="total")
  el-dialog(:visible.sync="dialogVisible", :title="'商品大类' + (formEditType == 1 ? '新增' : '修改')")
    b-form(:basicformConfig="formConfig", :modelForm="formObj", @formSubmit="formReturn", :formCancel="dialogClose")
      el-form-item(slot="append", label="大类图片", required)
        single-pic-upload(:extra="{ imgType: 'classify' }", v-model="classifyImg", :isChild="true", picAdvice="40 * 40")
</template>

<script>
import { mapState } from 'vuex'
import singlePicUpload from '@/components/SinglePicUpload.vue'
export default {
  layout: 'backend',
  components: {
    singlePicUpload
  },
  data() {
    return {
      total: 0,
      classifyImg: {},
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'create'
          },
          {
            lbl: '数据导出',
            type: 'excel'
          }
        ],
        hasCbx: true,
        tableHead: [
          {
            lbl: '名称',
            prop: 'name'
          },
          {
            lbl: '图片',
            prop: 'iconImg',
            width: '120',
            type: 'image',
            factValue(obj) {
              return obj ? obj.url : ''
            }
          },
          {
            type: 'action',
            width: '150',
            actionBtns: [
              {
                lbl: '编辑',
                type: 'edit'
              },
              {
                lbl: '删除',
                type: 'delete'
              }
            ]
          }
        ],
        tableData: []
      },
      formEditType: 1,
      dialogVisible: false,
      formConfig: {
        rules: {
          name: [
            { required: true, message: '大类名称不能为空', trigger: 'blur' }
          ]
          // icon: [{ required: true, message: '图标不能为空', trigger: 'blur' }]
        },
        formHeader: [
          {
            labelName: '大类名称',
            propName: 'name',
            type: 'input'
          }
          // {
          //   labelName: '大类图标',
          //   propName: 'icon',
          //   type: 'iptIconExample'
          // }
        ]
      },
      formObj: {
        name: '',
        icon: ''
      },
      currentPage: 1,
      searchName: ''
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
      console.log('btn type:>>', type)
      if (type === 'create') {
        this.formObj = {}
        this.classifyImg = {}
        this.dialogVisible = true
      }
      if (type === 'excel') {
        const me = this
        require.ensure([], () => {
          const {
            export_json_to_excel
          } = require('../../utils/excelExport/Export2Excel')
          const tHeader = ['名称']
          const filterVal = ['name']
          const list = me.tableValue.tableData
          const data = me.formatJson(filterVal, list)
          export_json_to_excel(tHeader, data, '列表_excel')
        })
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          // if (j === 'updateAt' || j === 'createAt' || j === 'expireTime') {
          //   return me.formatDate(v[j])
          // } else {
          return v[j]
          // }
        })
      )
    },
    tableRowEdit(idx, obj, type) {
      console.log('type', type)
      if (type === 'edit') {
        this.formObj = {
          id: obj.id,
          name: obj.name
        }
        if (obj.iconImg && obj.iconImg.id > 0) this.classifyImg = obj.iconImg
        this.dialogVisible = true
      } else if (type === 'delete') {
        const me = this
        this.confirmDialog(
          this,
          '一旦删除，所属该类的活动关联关系都将解除。 您确认要删除吗？'
        )
          .then(() => {
            me.deleteObj(obj.id)
          })
          .catch(() => {
            console.log('取消')
          })
      }
    },
    dialogClose() {
      this.dialogVisible = false
    },
    formReturn(obj) {
      if (!(this.classifyImg.id && this.classifyImg.id > 0)) {
        this.msgShow(this, '图片不能为空')
        return
      }
      this.formObj.name = obj.name
      this.formObj.iconImg = this.classifyImg.id
      this.dialogVisible = false
      this.saveOrUpdate()
    },
    async deleteObj(id) {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.classifyDelete + id,
          'delete',
          {}
        )
        if (data.return_code === 0) {
          this.msgShow(this, '删除成功', 'success')
          this.currentPage = 1
          this.loadData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async saveOrUpdate() {
      try {
        let method = 'post'
        if (this.formObj.id && this.formObj.id > 0) {
          method = 'put'
          delete this.formObj.createAt
          delete this.formObj.updateAt
        }
        this.formObj.bucket = this.currentUser.currentBucket.id
        let { data } = await this.proxy(
          this,
          this.apiList.classify,
          method,
          this.formObj
        )
        if (data.return_code === 0) {
          this.currentPage = 1
          this.msgShow(
            this,
            this.formObj.id > 0 ? '修改成功' : '保存成功',
            'success'
          )
          this.loadData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadData() {
      try {
        let body = {
          currentPage: this.currentPage - 1,
          pageSize: this.pageSize,
          bid: this.currentUser.currentBucket.id
        }
        if (this.searchName.length > 0) body.name = this.searchName
        else delete body.name
        let { data } = await this.proxy(
          this,
          this.apiList.classify,
          'get',
          body
        )
        console.log('data:>>', data)
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
