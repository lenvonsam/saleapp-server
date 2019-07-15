<template lang="pug">
.box
  .padding.bg-white
    b-table.mt-15(:tableValue="tableValue", @actionBtnClick="tableSearchBtns", @rowEdit="tableRowEdit", :rightPart="false", @chooseData="chooseRow")
    el-dialog(:visible.sync="dialogVisible", :title="'轮播图' + (formEditType == 1 ? '新增' : '修改')")
      el-form
        el-form-item(label="轮播图片", required)
          single-pic-upload(v-model="bannerImg", :extra="localData", :isChild="true")
        el-form-item(label="轮播类型")
          el-select(v-model="bannerType")
            el-option(label="只显示图片", value="0", key="0")
            el-option(label="外部链接", value="1", key="1")
            el-option(label="链接商品", value="2", key="2")
        el-form-item(v-if="bannerType == '1'", label="外部链接")
          el-input(placeholder="请输入外部链接地址(含http或https)", v-model="outlink", style="max-width: 60%")
        el-form-item(v-if="bannerType == '2'", label="所属商品", style="max-width: 80%")
          .row
            .col.pr-5
              el-select(placeholder="选择活动", v-model="activityName", filterable)
                el-option(v-for="act in activities", :key="act.id", :value="act.id", :label="act.name")
            .col.pl-5
              el-select(placeholder="选择所属商品", v-model="productName", v-if="products.length > 0")
                el-option(v-for="p in products", :key="p.id", :value="p.id", :label="p.title")
        el-form-item
          el-button(type="primary", @click="saveAction") 保存
          el-button(@click="dialogVisible = false") 取消
    el-dialog(:visible.sync="previewVisible", title="链接预览")
      template(v-if="bannerType == '0'")
        img.full-width(:src="editObj.img.url", v-if="editObj.img")
      template(v-else-if="bannerType == '1'")
        iframe(style="width: 100%; height: 500px;border: none;", :src="editObj.url")
      template(v-else)
        .text-center.h5 请在手机端查看
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
      formEditType: 1,
      bannerType: '0',
      activities: [],
      products: [],
      deleteArr: [],
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'create'
          },
          {
            lbl: '批量删除',
            type: 'batchDelete'
          }
        ],
        hasCbx: true,
        tableHead: [
          {
            lbl: '图片',
            type: 'image',
            prop: 'img',
            factValue(obj) {
              return obj.url
            }
          },
          {
            lbl: '类型',
            type: 'object',
            factValue(row) {
              if (row.type === 0) {
                return '只显示图片'
              } else if (row.type === 1) {
                return '外部链接'
              } else {
                return '链接商品'
              }
            }
          },
          {
            type: 'action',
            actionBtns: [
              {
                lbl: '编辑',
                type: 'edit'
              },
              {
                lbl: '链接效果',
                type: 'link'
              }
            ]
          }
        ],
        tableData: [],
        footerHide: true
      },
      localData: {
        imgType: 'banner'
      },
      dialogVisible: false,
      dialogImageUrl: '',
      editObj: {},
      bannerImg: {},
      outlink: '',
      activityName: '',
      productName: '',
      previewVisible: false
    }
  },
  computed: {
    ...mapState({
      fileUploadUrl: state => state.fileUploadUrl,
      currentUser: state => state.user.currentUser
    })
  },
  watch: {
    activityName(newVal, oldVal) {
      console.log('act newval:>>', newVal)
      this.productName = ''
      this.products = []
      this.activityProducts()
    }
  },
  beforeMount() {
    this.localData.bid = this.currentUser.currentBucket.id
    this.loadData()
    this.activityDropdown()
  },
  methods: {
    chooseRow(val) {
      this.deleteArr = val
    },
    async activityProducts() {
      try {
        this.pageShow(this)
        let url = this.apiList.acitvityProducts.replace('$', this.activityName)
        let { data } = await this.proxy(this, url)
        this.pageHide(this)
        if (data.return_code === 0)
          this.products = data.arr.filter(itm => itm.status === 1)
      } catch (e) {
        this.pageHide(this)
        console.log(e)
      }
    },
    async activityDropdown() {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.activityDropdown,
          'get',
          {
            bid: this.currentUser.currentBucket.id
          }
        )
        if (data.return_code === 0) this.activities = data.list
      } catch (e) {
        console.log(e)
      }
    },
    tableRowEdit(idx, row, type) {
      console.log(row)
      console.log(type)
      this.editObj = row
      this.bannerType = this.editObj.type.toString()
      if (type === 'link') {
        this.previewVisible = true
      }
      if (type === 'edit') {
        this.bannerImg = this.editObj.img
        this.formEditType = 2
        if (this.bannerType === '1') this.outlink = this.editObj.url
        if (this.bannerType === '2') {
          if (this.editObj.productUrl) {
            let arr = this.editObj.productUrl.split('?')
            // console.log('arr:>>', arr)
            // this.productName = Number(
            //   arr[0].substring(arr[0].lastIndexOf('/') + 1)
            // )
            this.activityName = Number(
              arr[1].substring(arr[1].indexOf('=') + 1)
            )
          }
        }
        this.dialogVisible = true
      }
    },
    tableSearchBtns(type) {
      console.log(type)
      if (type === 'create') {
        this.bannerImg = {}
        this.outlink = ''
        this.bannerType = '0'
        this.dialogVisible = true
      }
      if (type === 'batchDelete') {
        if (this.deleteArr.length === 0) {
          this.msgShow(this, '请选择删除行')
          return
        }
        const me = this
        this.confirmDialog(this, '您确认要删除吗').then(res => {
          if (res === 'confirm') {
            console.log('confirm')
            me.handleRemove()
          }
        })
      }
    },
    async saveAction() {
      if (!(this.bannerImg.id && this.bannerImg.id > 0)) {
        this.msgShow(this, '请选择图片')
        return
      }
      // console.log('active name:>>', this.activityName)
      // return
      if (
        this.bannerType === '1' &&
        this.outlink.toString().trim().length === 0
      ) {
        this.msgShow(this, '外部链接地址不能为空')
        return
      }
      if (this.bannerType === '2' && this.productName < 1) {
        this.msgShow(this, '请选择需链接的商品')
        return
      }
      var body = {
        img: this.bannerImg.id,
        type: Number(this.bannerType),
        bucket: this.currentUser.currentBucket.id
      }
      if (this.bannerType === '1') body.url = this.outlink.trim()
      if (this.bannerType === '2')
        body.productUrl =
          '/product/' + this.productName + '?actId=' + this.activityName
      if (this.formEditType === 2) body.id = this.editObj.id
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          this.apiList.banners,
          'post',
          body
        )
        this.pageHide(this)
        this.dialogVisible = false
        if (data.return_code === 0) {
          this.msgShow(
            this,
            this.formEditType === 1 ? '新增成功' : '更新成功',
            'success'
          )
          this.loadData()
        }
      } catch (e) {
        this.pageHide(this)
        this.dialogVisible = false
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async handleRemove() {
      try {
        let ids = this.deleteArr.map(itm => itm.id).join(',')
        let { data } = await this.proxy(this, this.apiList.banners, 'delete', {
          ids: ids
        })
        if (data.return_code === 0) {
          this.msgShow(this, '删除成功', 'success')
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
        this.pageShow(this)
        let { data } = await this.proxy(this, this.apiList.banners, 'get', {
          bid: this.currentUser.currentBucket.id
        })
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

<style lang="stylus" scoped>
</style>
