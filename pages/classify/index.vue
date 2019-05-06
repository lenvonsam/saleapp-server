<template lang="pug">
.box
  b-table(:tableValue="tableValue", @actionBtnClick="tableSearchBtns", @rowEdit="tableRowEdit", @rightTopSearch="topSearchValue")
  el-dialog(:visible.sync="dialogVisible", :title="'商品大类' + (formEditType == 1 ? '新增' : '修改')")
    b-form(:basicformConfig="formConfig", :modelForm="formObj", @formSubmit="formReturn", :formCancel="dialogClose")
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
          }
        ],
        hasCbx: true,
        tableHead: [
          {
            lbl: '名称',
            prop: 'name'
          },
          {
            lbl: '图标',
            prop: 'icon'
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
      formEditType: 1,
      dialogVisible: false,
      formConfig: {
        rules: {
          name: [
            { required: true, message: '大类名称不能为空', trigger: 'blur' }
          ],
          icon: [{ required: true, message: '图标不能为空', trigger: 'blur' }]
        },
        formHeader: [
          {
            labelName: '大类名称',
            propName: 'name',
            type: 'input'
          },
          {
            labelName: '大类图标',
            propName: 'icon',
            type: 'iptIconExample'
          }
        ]
      },
      formObj: {
        name: '',
        icon: ''
      },
      currentPage: 0,
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
    topSearchValue(val) {
      if (val.length > 0) {
        this.searchName = val
      } else {
        this.searchName = ''
      }
      this.currentPage = 0
      this.loadData()
    },
    tableSearchBtns(type) {
      console.log('btn type:>>', type)
      if (type === 'create') {
        this.formObj = {}
        this.dialogVisible = true
      }
    },
    tableRowEdit(idx, obj, type) {
      this.formObj = Object.assign({}, obj)
      this.dialogVisible = true
    },
    dialogClose() {
      this.dialogVisible = false
    },
    formReturn(obj) {
      console.log('form submit', obj)
      this.formObj = Object.assign(this.formObj, obj)
      console.log('form obj:>>', this.formObj)
      this.dialogVisible = false
      this.saveOrUpdate()
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
          this.currentPage = 0
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
          currentPage: this.currentPage,
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
        if (data && data.list.length > 0) {
          this.tableValue.tableData = data.list
        } else {
          this.tableValue.tableData = []
          this.currentPage--
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
