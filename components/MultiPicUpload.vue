<template lang="pug">
  div
    el-upload(:action="fileUploadUrl",list-type="picture-card", :on-preview="handlePictureCardPreview",:before-upload="beforePicUpload",name="img", :data="localData", :on-success="uploadSuccess", :on-remove="handlePictureRemove", multiple, :file-list="picList")
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
      type: Array,
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
      dialogImageUrl: '',
      dialogVisible: false,
      picList: [],
      emitList: [],
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
      console.log(newVal)
      this.initConfig(newVal)
      // if (oldVal === '') {
      //   let arr = newVal.split(',')
      //   this.dialogImageUrl = arr[0]
      //   const me = this
      //   let tempList = []
      //   for (let k = 0; k < arr.length; k++) {
      //     tempList.push({
      //       name: k + '.jpg',
      //       url: arr[k],
      //       response: { url: arr[k] }
      //     })
      //   }
      //   console.log('tempList:>>')
      //   console.log(tempList)
      //   me.picList = tempList
      // }
    }
  },
  beforeMount() {
    console.log('beforeMount>>>' + this.value)
    this.$nextTick(function() {
      this.initConfig(this.value)
      if (this.extra) {
        delete this.extra.action
        Object.keys(this.extra).map(k => {
          this.localData[k] = this.extra[k]
        })
        this.localData.bid = this.currentUser.currentBucket.id
      }
    })
  },
  methods: {
    initConfig(arr) {
      if (arr.length > 0) {
        // let arr = newVal.split(',')
        this.dialogImageUrl = arr[0].url
        let tempList = []
        for (let k = 0; k < arr.length; k++) {
          tempList.push({
            name: k + '.jpg',
            url: arr[k].url,
            response: { url: arr[k].url, id: arr[k].id }
          })
        }
        console.log('tempList:>>')
        // console.log(tempList)
        this.picList = tempList
        this.emitList = arr
      }
    },
    handlePictureCardPreview(file) {
      console.log('preview url')
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
      console.log('success resp:>>', resp)
      console.log('fileList', fileList)
      console.log('pic list', this.picList)
      this.emitList.unshift(resp.data)
      console.log('emit list:>>', this.emitList)
      this.$emit('input', this.emitList)
    },
    handlePictureRemove(file, fileList) {
      console.log('value:>>', this.value)
      console.log('pic list:>>', this.picList)
      console.log('remove file ', file)
      console.log('remove file list', fileList)
      this.$emit('input', this.getValue(fileList))
    },
    getValue(fileList) {
      let temp = []
      fileList.map(itm => {
        temp.push(itm.response)
      })
      this.emitList = temp
      return temp
    }
  }
}
</script>
