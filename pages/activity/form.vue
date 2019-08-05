<template lang="pug">
.box
  i-box
    b-form(:basicformConfig="formConfig", :modelForm="formObj", @formSubmit="formReturn")
      template(slot="append")
        el-form-item(label="开始日期", required)
          el-date-picker(v-model="startTime", format="yyyy-MM-dd HH:mm:ss", value-format="yyyy-MM-dd HH:mm:ss", type="datetime", style="width: 70%")
        el-form-item(label="结束日期", required)
          el-date-picker(v-model="endTime", format="yyyy-MM-dd HH:mm:ss", value-format="yyyy-MM-dd HH:mm:ss", type="datetime", style="width: 70%")
        el-form-item(label="活动背景", required)
          single-pic-upload(v-model="logoImg", :extra="fileExt")
        el-form-item(label="活动攻略", required)
          el-col(:span="13")
            q-editor(v-model="activityRichContent")
          el-col.pl-15(:span="11")
            .preview-toolbar 实时预览
            .preview-container
              .preview-content(v-html="activityRichContent")
        el-form-item(label="活动小图标")
          single-pic-upload(v-model="iconImg", :extra="{imgType: 'activityIcon'}", :picAdvice="'40 * 40'")
        el-form-item(label="所属大类", v-if="formObj.id > 2")
          el-select(v-model="classifyName", placeholder="请输入大类名称", filterable, multiple, v-if="remoteClassifies.length > 0")
            el-option(v-for="clf in remoteClassifies", :key="clf.id", :label="clf.name", :value="clf.id")
</template>

<script>
import { mapState, mapActions } from 'vuex'
import singlePicUpload from '@/components/SinglePicUpload.vue'
import qEditor from '@/components/QuillEditor.vue'
export default {
  layout: 'backend',
  components: {
    singlePicUpload,
    qEditor
  },
  data() {
    return {
      fileExt: {
        imgType: 'activity'
      },
      formConfig: {
        rules: {
          name: [
            { required: true, message: '活动名称不能为空', trigger: 'blur' }
          ]
        },
        formHeader: [
          {
            labelName: '活动名称',
            propName: 'name',
            type: 'input'
          }
        ]
      },
      formObj: {},
      logoImg: {},
      iconImg: {},
      activityRichContent: '',
      classifyName: [],
      remoteClassifies: [],
      startTime: '',
      endTime: ''
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  beforeMount() {
    this.$nextTick(function() {
      console.log(this.$route.query)
      let query = this.$route.query
      let val = query.type === 'new' ? '活动新增' : '活动修改'
      this.configVal({ key: 'currentTopTitle', val: val })
      if (query.type === 'edit') this.activityDetail()
      this.loadClassifies()
    })
  },
  methods: {
    ...mapActions(['configVal']),
    formReturn(obj) {
      this.formObj = Object.assign({}, obj)
      if (this.formObj.id > 0) {
        delete this.formObj.updateAt
        delete this.formObj.createAt
        delete this.formObj.classifies
      }
      this.formObj.stTime = this.startTime
      this.formObj.edTime = this.endTime
      delete this.formObj.startTime
      delete this.formObj.endTime
      if (this.classifyName.length > 0) {
        this.formObj.parentIds = this.classifyName.join(',')
      } else {
        delete this.formObj.parentIds
      }
      if (this.startTime.length === 0) {
        this.msgShow(this, '开始日期不能为空')
        return
      }
      if (this.endTime.length === 0) {
        this.msgShow(this, '结束日期不能为空')
        return
      }
      let st = new Date(this.formObj.stTime).getTime()
      let ed = new Date(this.formObj.edTime).getTime()
      if (st > ed) {
        this.msgShow(this, '结束日期不能小于开始日期')
        return
      }
      if (this.logoImg.id == undefined) {
        this.msgShow(this, '请上传活动背景图')
        delete this.formObj.coverImg
        return
      } else {
        this.formObj.coverImg = this.logoImg.id
      }
      if (this.activityRichContent.length === 0) {
        this.msgShow(this, '活动攻略不能为空')
        delete this.formObj.strategy
        return
      } else {
        this.formObj.strategy = this.activityRichContent
      }
      if (this.iconImg.id > 0) {
        this.formObj.smallIcon = this.iconImg.id
      } else {
        delete this.formObj.smallIcon
      }
      this.formObj.bucket = this.currentUser.currentBucket.id
      console.log('parent ids:>>', this.formObj.parentIds)
      this.saveOrUpdate()
    },
    async activityDetail() {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.activityDetail + this.$route.query.id
        )
        if (data.return_code === 0) {
          console.log('activity obj:>>', data.obj)
          this.startTime = this.date2Time(data.obj.startTime)
          this.endTime = this.date2Time(data.obj.endTime)
          delete data.obj.updateAt
          delete data.obj.createAt
          this.formObj = Object.assign({}, data.obj)
          this.activityRichContent = this.formObj.strategy
          if (this.formObj.coverImg)
            this.logoImg = Object.assign({}, this.formObj.coverImg)
          if (this.formObj.classifies.length > 0) {
            this.classifyName = this.formObj.classifies.map(itm => itm.id)
          }
          if (this.formObj.smallIcon)
            this.iconImg = Object.assign({}, this.formObj.smallIcon)
          console.log('form obj', this.formObj)
          this.$forceUpdate()
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
          this.apiList.activity,
          method,
          this.formObj
        )
        if (data.return_code === 0) {
          this.msgShow(
            this,
            `活动${this.$route.query.type === 'new' ? '保存' : '修改'}成功`,
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
    },
    async loadClassifies() {
      try {
        let body = {
          currentPage: 0,
          pageSize: 100,
          bid: this.currentUser.currentBucket.id
        }
        let { data } = await this.proxy(
          this,
          this.apiList.classify,
          'get',
          body
        )
        if (data.return_code === 0) {
          this.remoteClassifies = data.list
        } else {
          this.remoteClassifies = []
        }
      } catch (e) {
        this.remoteClassifies = []
      }
    }
  }
}
</script>
