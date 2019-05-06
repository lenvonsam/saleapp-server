<template lang="pug">
  div
    el-upload(:action="fileUploadUrl",list-type="picture-card", :on-preview="handlePictureCardPreview",:before-upload="beforePicUpload",name="img", :data="localData",:file-list="picList",:on-success="uploadSuccess", :on-remove="picReomve")
      i.el-icon-plus
      .el-upload__tip(slot="tip") 只能上传jpg/png文件，且不超过2M,图片长宽建议{{picAdvice}}
    el-dialog(:visible.sync="dialogVisible", size="tiny", :append-to-body="isChild")
      img(width="100%", :src="dialogImageUrl")
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    isChild: {
      type: Boolean,
      default: false
    },
    picAdvice: {
      type: String,
      default: '100 * 100'
    },
    extra: {
      type: null,
      default: false
    }
  },
  data() {
    return {
      picList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      localData: {
        action: 'uploadimage'
      }
    }
  },
  computed: {
    ...mapState({
      fileUploadUrl: state => state.fileUploadUrl,
      currentUser: state => state.user.currentUser
    })
  },
  watch: {
    value(newVal, oldVal) {
      if (newVal) {
        this.dialogImageUrl = this.value.url
        this.picList = [
          {
            name: 'fisrt.jpg',
            url: this.dialogImageUrl,
            response: { id: this.value.id, url: this.dialogImageUrl }
          }
        ]
      } else {
        this.dialogImageUrl = {}
        this.picList = []
      }
    }
  },
  beforeMount() {
    if (this.value && this.value.url) {
      this.dialogImageUrl = this.value.url || ''
      this.picList = [
        {
          name: 'fisrt.jpg',
          url: this.dialogImageUrl,
          response: { url: this.dialogImageUrl, id: this.value.id }
        }
      ]
    }
    if (this.extra) {
      delete this.extra.action
      Object.keys(this.extra).map(k => {
        this.localData[k] = this.extra[k]
      })
      this.localData.bid = this.currentUser.currentBucket.id
    }
  },
  methods: {
    handlePictureCardPreview(file) {
      console.log('pic on-preview')
      console.log(file)
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    beforePicUpload(file) {
      var imgType = file.type === 'image/png' || file.type === 'image/jpeg'
      var imgSize = file.size / 1000000 <= 2
      if (!imgType) {
        this.$message.error('上传图片格式错误!')
      }
      if (!imgSize) {
        this.$message.error('上传图片大不能超过2M!')
      }
      return imgType && imgSize
    },
    uploadSuccess(resp, file, fileList) {
      console.log('file resp', resp)
      console.log('file', file)
      console.log('file', fileList)
      this.picList = [file]
      this.$emit('input', file.response.data)
    },
    picReomve(file, fileList) {
      this.picList = []
      this.$emit('input', {})
    }
  }
}
</script>

<style scoped>
</style>
