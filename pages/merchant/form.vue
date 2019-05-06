<template lang="pug">
.box
  i-box
    b-form(:basicformConfig="formConfig", :modelForm="formObj", @formSubmit="formReturn")
      template(slot="append")
        el-form-item(label="商户logo")
          single-pic-upload(v-model="logoImg", :extra="fileExt")
        el-form-item(label="企业资质")
          single-pic-upload(v-model="etpImg", :extra="fileExt")
        el-form-item(label="行业资质")
          single-pic-upload(v-model="jobImg", :extra="fileExt")
        el-form-item(label="启用状态")
          el-select(v-model="merchantStatus")
            el-option(value="1", label="启用")
            el-option(value="0", label="禁用")
</template>

<script>
import singlePicUpload from '@/components/SinglePicUpload.vue'
import { mapActions, mapState } from 'vuex'
export default {
  layout: 'backend',
  components: {
    singlePicUpload
  },
  data() {
    return {
      fileExt: {
        imgType: 'merchant'
      },
      canShow: false,
      // logo 对象
      logoImg: {},
      // 企业资质
      etpImg: {},
      // 行业资质
      jobImg: {},
      // 开店日期
      startDate: '',
      formObj: {},
      formConfig: {
        rules: {
          name: [
            { required: true, message: '商户名称不能为空', trigger: 'blur' }
          ],
          username: [
            { required: true, message: '登录名称不能为空', trigger: 'blur' }
          ],
          addr: [
            { required: true, message: '商户地址不能为空', trigger: 'blur' }
          ]
        },
        formHeader: [
          {
            labelName: '登录名称',
            propName: 'username',
            type: 'input'
          },
          {
            labelName: '商户名称',
            propName: 'name',
            type: 'input'
          },
          {
            labelName: '商户地址',
            propName: 'addr',
            type: 'input'
          },
          {
            labelName: '服务电话',
            propName: 'servicePhone',
            type: 'input'
          },
          {
            labelName: '商户简介',
            propName: 'intro',
            type: 'textarea'
          },
          {
            labelName: '开店日期',
            propName: 'setupTime',
            type: 'date'
          }
        ]
      },
      merchantStatus: '1'
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  beforeMount() {
    console.log(this.$route.query)
    let query = this.$route.query
    let title = ''
    query.type === 'new' ? (title = '商户新增') : (title = '商户修改')
    this.configVal({ key: 'currentTopTitle', val: title })
    if (query.type === 'edit') this.merchantDetail()
  },
  methods: {
    ...mapActions(['configVal']),
    formReturn(obj) {
      console.log('formreturn:>>', obj)
      console.log('logo img:>>', this.logoImg)
      this.formObj = Object.assign(this.formObj, obj)
      if (this.formObj.setupTime && this.formObj.setupTime.length === 0) {
        delete this.formObj.setupTime
      }
      if (this.logoImg.id && this.logoImg.id > 0) {
        this.formObj.logoFile = Number(this.logoImg.id)
      } else {
        delete this.formObj.logoFile
      }
      if (this.etpImg.id && this.etpImg.id > 0) {
        this.formObj.etpQualify = Number(this.etpImg.id)
      } else {
        delete this.formObj.etpQualify
      }
      if (this.jobImg.id && this.jobImg.id > 0) {
        this.formObj.industryQualify = Number(this.jobImg.id)
      } else {
        delete this.formObj.industryQualify
      }
      if (this.$route.query.type === 'edit') {
        delete this.formObj.updateAt
        delete this.formObj.createAt
        delete this.formObj.setUp
        delete this.formObj.acct
      }
      this.formObj.bucket = this.currentUser.currentBucket.id
      this.formObj.status = Number(this.merchantStatus)
      this.saveOrUpdate()
    },
    async merchantDetail() {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.merchantDetail + this.$route.query.id
        )
        if (data.return_code === 0) {
          data.obj.setupTime = this.date2Str(data.obj.setUp)
          this.formObj = Object.assign({}, data.obj)
          this.formObj.username = data.obj.acct.username
          this.merchantStatus = data.obj.acct.status.toString()
          if (this.formObj.logoFile)
            this.logoImg = Object.assign({}, this.formObj.logoFile)
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
        if (this.$route.query.type === 'edit') method = 'put'
        let { data } = await this.proxy(
          this,
          this.apiList.merchant,
          method,
          this.formObj
        )
        if (data.return_code === 0) {
          this.msgShow(
            this,
            `商户${this.$route.query.type === 'new' ? '保存' : '修改'}成功`,
            'success'
          )
          this.back()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
