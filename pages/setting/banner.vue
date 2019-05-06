<template lang="pug">
.box
  .padding.bg-white
    el-upload(:action="fileUploadUrl", :on-preview="handlePreview", :before-remove="handleRemove", :file-list="banners", list-type="picture", :data="localData", :on-success="uploadSuccess", :before-upload="beforePicUpload", name="img", style="max-width: 60%")
      el-button(size="small", type="primary") 点击上传
      div(slot="tip") 只能上传jpg/png文件，且不能超过500kb
    el-dialog(:visible.sync="dialogVisible", size="tiny", :append-to-body="true")
      img(width="100%", :src="dialogImageUrl")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      banners: [],
      localData: {
        action: 'uploadimage',
        imgType: 'banner'
      },
      dialogVisible: false,
      dialogImageUrl: ''
    }
  },
  computed: {
    ...mapState({
      fileUploadUrl: state => state.fileUploadUrl,
      currentUser: state => state.user.currentUser
    })
  },
  beforeMount() {
    this.localData.bid = this.currentUser.currentBucket.id
    this.loadData()
  },
  methods: {
    handlePreview(file) {
      console.log('preview file', file)
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async handleRemove(file, fileList) {
      console.log('remove file', file)
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.bannerDelete + file.id,
          'delete'
        )
        if (data.return_code === 0) {
          this.msgShow(this, '删除成功', 'success')
          this.banners = []
          this.loadData()
          return true
        } else {
          this.msgShow(data.message)
          return false
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
        return false
      }
    },
    uploadSuccess() {
      this.msgShow(this, '上传成功', 'success')
      this.banners = []
      this.loadData()
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

    async loadData() {
      try {
        let { data } = await this.proxy(this, this.apiList.banners, 'get', {
          type: 'banner',
          bucket: this.currentUser.currentBucket.id
        })
        if (data.return_code === 0) {
          data.list.map((itm, idx) => {
            this.banners.push({
              id: itm.id,
              url: itm.url,
              name: '第' + (idx + 1) + '轮播图'
            })
          })
          // this.banners = data.list
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

<style lang="stylus" scoped>
</style>
