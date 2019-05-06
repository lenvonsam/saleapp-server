<template lang="pug">
i-box(:topHidden="false", title="账户列表")
  b-table(:tableValue="tableConfig", :loading="dataLoad", @rightTopSearch="topSearch", @actionBtnClick="btnGroupClick", :total="totalRecords", @rowEdit="rowCellEdit")
  el-dialog(:visible.sync="dialogVisible", :title="'账户' + (formEditType == 1 ? '新增' : '修改')")
    b-form(:basicformConfig="formConfig", :modelForm="acctObj", :formCancel="dialogFormCancel", :resetForm="dialogVisible", @formSubmit="formResult")
      div(slot="append")
        el-form-item(label="所属空间", required)
          el-select(v-model="chooseBucketId", @change="bucketSelect")
            el-option(v-for="bucket in allBuckets", :label="bucket.name", :value="bucket.id", :key="bucket.id")
        el-form-item(label="空间角色", v-if="chooseBucketId > 0",  required)
          el-select(v-model="roleId")
            el-option(v-for="role in bucketRoles", :label="role.name", :value="role.id", :key="role.id")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'topLayout',
  data() {
    return {
      dialogVisible: false,
      // 1 新增 2 修改
      formEditType: 1,
      tableConfig: {
        hasCbx: true,
        tableHead: [
          { lbl: '账户名', prop: 'username' },
          {
            lbl: '账户等级',
            prop: 'acctLevel',
            type: 'enum',
            enumMap: {
              0: '普通员工',
              1: '子公司管理员',
              2: '公司管理员',
              3: '超级管理管理员'
            }
          },
          {
            lbl: '所属空间',
            type: 'object',
            factValue: function(itm) {
              return itm.buckets.map(item => item.name).join(',')
            }
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                type: 'edit',
                lbl: '编辑'
              }
            ]
          }
        ],
        tableData: [],
        actions: [
          {
            lbl: '新增',
            type: 'create',
            class: 'primary'
          }
        ]
      },
      dataLoad: true,
      currentPage: 0,
      totalRecords: 0,
      acctObj: {},
      formConfig: {
        formHeader: [
          {
            labelName: '登录名称',
            propName: 'username',
            type: 'input'
          },
          {
            labelName: '账户权限',
            propName: 'acctLevel',
            type: 'select',
            optKey: 'id',
            optLbl: 'name',
            dataType: 'array',
            listArray: [
              { id: 0, name: '普通' },
              { id: 1, name: '子公司管理员' },
              { id: 2, name: '公司管理员' }
            ]
          },
          {
            labelName: '邮箱',
            propName: 'email',
            type: 'input'
          },
          {
            labelName: '手机号',
            propName: 'phone',
            type: 'input'
          },
          {
            labelName: '昵称',
            propName: 'nickname',
            type: 'input'
          },
          {
            labelName: '真实姓名',
            propName: 'realName',
            type: 'input'
          }
          // {
          //   labelName: '所属空间',
          //   propName: 'currentBucket',
          //   type: 'select',
          //   optKey: 'id',
          //   optLbl: 'name',
          //   dataType: 'api',
          //   dataUrl: '/backend/account/allBuckets',
          //   listName: 'bucketList'
          // }
        ],
        rules: {
          username: [
            { required: true, message: '请输入账户名称', trigger: 'blur' }
          ],
          acctLevel: [
            { required: true, message: '请选择账户权限', trigger: 'blur' }
          ]
        }
      },
      allBuckets: [],
      bucketRoles: [],
      chooseBucketId: '',
      roleId: ''
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser,
      pageSize: state => state.pageSize
    })
  },
  watch: {
    'acctObj.currentBucket': {
      handler(newVal, oldVal) {
        console.log('change bucket:>.', newVal)
      },
      deep: true
    }
  },
  beforeMount() {
    this.$nextTick(function() {
      this.callAccountList()
      this.loadBuckets()
    })
  },
  methods: {
    formResult(obj) {
      this.acctObj = Object.assign({}, obj)
      this.dialogVisible = false
      if (this.chooseBucketId < 1) {
        this.msgShow(this, '请选择所属空间')
        return
      }
      if (this.roleId < 1) {
        this.msgShow(this, '请选择空间角色')
        return
      }
      this.callAccountSaveOrUpdate()
    },
    async callAccountList() {
      try {
        let { data } = await this.proxy(this, this.apiList.accounts, 'get', {
          // creatorId: this.currentUser.id,
          currentPage: this.currentPage,
          pageSize: this.pageSize
        })
        console.log(data)
        if (data.list.length > 0) {
          this.tableConfig.tableData = data.list
        } else {
          this.tableConfig.tableData = []
        }
        this.totalRecords = data.total
        this.dataLoad = false
      } catch (e) {
        this.dataLoad = false
        this.msgShow(this, '网络异常')
      }
    },
    async callAccountSaveOrUpdate() {
      try {
        delete this.acctObj.bucketList
        delete this.acctObj.buckets
        delete this.acctObj.createAt
        delete this.acctObj.updateAt
        delete this.acctObj.expireTime

        // if (this.acctObj.currentBucket.id)
        if (this.formEditType === 1) this.acctObj.status = 1
        this.acctObj.currentBucket = this.chooseBucketId
        this.acctObj.roleId = this.roleId

        this.acctObj.creator = this.currentUser.id
        let { data } = await this.proxy(
          this,
          this.apiList.accounts,
          this.formEditType == 1 ? 'post' : 'put',
          this.acctObj
        )
        if (data.return_code === 0) {
          this.currentPage = 0
          this.dataLoad = true
          this.callAccountList()
          this.msgShow(
            this,
            `账号${this.formEditType == 1 ? '创建' : '更新'}成功`,
            'success'
          )
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.error(e)
        this.msgShow(this, '操作失败')
      }
    },
    rowCellEdit(idx, obj) {
      console.log('row index:>>', idx, '; obj:>>', obj)
      this.acctObj = obj
      this.chooseBucketId = this.acctObj.currentBucket.id
      this.queryBucketRoles()
      this.formEditType = 2
      this.dialogVisible = true
    },
    topSearch(val) {
      console.log('search val', val)
    },
    dialogFormCancel() {
      this.dialogVisible = false
    },
    btnGroupClick(type) {
      console.log('btnGroupClick', type)
      if (type === 'create') {
        this.acctObj = {}
        this.formEditType = 1
        this.chooseBucketId = ''
        this.roleId = ''
        this.dialogVisible = true
      }
    },
    async loadBuckets() {
      try {
        let { data } = await this.proxy(this, this.apiList.allBuckets)
        if (data.return_code === 0) this.allBuckets = data.list
        else this.msgShow(this, data.message)
      } catch (e) {
        console.log(e)
      }
    },
    bucketSelect(val) {
      console.log('bucket select val', val)
      this.chooseBucketId = val
      this.queryBucketRoles()
    },
    async queryBucketRoles() {
      try {
        let { data } = await this.proxy(this, this.apiList.roleBucket, 'get', {
          bid: this.chooseBucketId
        })
        if (data.return_code === 0) this.bucketRoles = data.list
        else this.msgShow(this, data.message)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
