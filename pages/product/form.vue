<template lang="pug">
.box
  i-box
    b-form(:basicformConfig="formConfig", :modelForm="formObj", @formSubmit="formReturn")
      template(slot="append")
        el-form-item(label="商品详情", required)
          el-col(:span="13")
            q-editor(v-model="productRichContent")
          el-col.pl-15(:span="11")
            .preview-toolbar 实时预览
            .preview-container
              .preview-content(v-html="productRichContent")
        el-form-item(label="商品封面", required)
          single-pic-upload(v-model="logoImg", :extra="fileExt")
        el-form-item(label="分享背景图", required)
          single-pic-upload(v-model="shareImg", :extra="fileExt")
        el-form-item(label="商品轮播图", required)
          multi-pic-upload(v-model="bannerImg", :extra="fileExt")
        el-form-item(label="平台佣金", required)
          el-input-number(v-model="platformRatio")
        el-form-item(label="分销区间", required)
          el-col(:span="5")
            el-input-number(placeholder="最低金额", v-model="minSale")
          el-col(:span="5")
            el-input-number(placeholder="最高金额", v-model="maxSale")
        el-form-item(label="所属商户", v-if="currentUser.acctLevel == 2 || currentUser.acctLevel == 3", required)
          el-autocomplete(v-model="merchantName", :fetch-suggestions="merchantRemoteSearch", placeholder="请输入商户名称", @select="merchantSelect")
            template(slot-scope="{item}")
              div {{item.name}}
  </template>
</template>
<script>
import singlePicUpload from '@/components/SinglePicUpload.vue'
import multiPicUpload from '@/components/MultiPicUpload.vue'
import qEditor from '@/components/QuillEditor.vue'
import { mapActions, mapState } from 'vuex'
export default {
  layout: 'backend',
  components: {
    singlePicUpload,
    qEditor,
    multiPicUpload
  },
  data() {
    return {
      fileExt: {
        imgType: 'product'
      },
      canShow: false,
      // 商品封面
      logoImg: {},
      // 分享图片封面
      shareImg: {},
      // banner图片
      bannerImg: [],
      platformRatio: 1,
      maxSale: 1,
      minSale: 0.1,
      formObj: {},
      formConfig: {
        rules: {
          title: [
            { required: true, message: '商品标题不能为空', trigger: 'blur' }
          ],
          subTitle: [
            { required: true, message: '商品副标题不能为空', trigger: 'blur' }
          ],
          stock: [
            { required: true, message: '商品库存不能为空', trigger: 'blur' }
          ],
          originPrice: [
            { required: true, message: '商品原价不能为空', trigger: 'blur' }
          ],
          discountPrice: [
            { required: true, message: '商品折扣价不能为空', trigger: 'blur' }
          ]
        },
        formHeader: [
          {
            labelName: '商品标题',
            propName: 'title',
            type: 'input'
          },
          {
            labelName: '商品副标题',
            propName: 'subTitle',
            type: 'input'
          },
          {
            labelName: '商品库存',
            propName: 'stock',
            type: 'inputNumber'
          },
          {
            labelName: '商品原价',
            propName: 'originPrice',
            type: 'inputNumber'
          },
          {
            labelName: '商品折扣价',
            propName: 'discountPrice',
            type: 'inputNumber'
          }
        ]
      },
      merchantStatus: '1',
      productRichContent: '',
      merchantName: '',
      merchantId: -1
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
    query.type === 'new' ? (title = '商品新增') : (title = '商品修改')
    this.configVal({ key: 'currentTopTitle', val: title })
    if (query.type === 'edit') this.productDetail()
  },
  methods: {
    ...mapActions(['configVal']),
    merchantSelect(item) {
      console.log('merchant select item', item)
      this.merchantName = item.name
      this.merchantId = item.id
    },
    merchantRemoteSearch(queryString, cb) {
      this.queryMerchants(queryString, cb)
    },
    async queryMerchants(name, cb) {
      try {
        let body = {
          currentPage: 0,
          pageSize: 20,
          bid: this.currentUser.currentBucket.id,
          name: name
        }
        let { data } = await this.proxy(
          this,
          this.apiList.merchant,
          'get',
          body
        )
        if (data.return_code === 0) {
          cb(data.list)
        } else {
          cb([])
        }
      } catch (e) {
        cb([])
      }
    },
    formReturn(obj) {
      console.log('formreturn:>>', obj)
      console.log('logo img:>>', this.logoImg)
      this.formObj = Object.assign(this.formObj, obj)
      if (this.productRichContent.length === 0) {
        this.msgShow(this, '商品详情不能为空')
        delete this.formObj.intro
        return
      } else {
        this.formObj.intro = this.productRichContent
      }
      if (this.logoImg.id === undefined) {
        this.msgShow(this, '商品封面不能为空')
        return
      }
      if (this.shareImg.id === undefined) {
        this.msgShow(this, '商品分享图不能为空')
        return
      }
      if (this.platformRatio <= 0) {
        this.msgShow(this, '必须大于0')
        return
      }
      if (this.minSale <= 0) {
        this.msgShow(this, '必须大于0')
        return
      }
      if (this.maxSale <= 0) {
        this.msgShow(this, '必须大于0')
        return
      }
      if (this.maxSale < this.minSale) {
        this.msgShow(this, '最低金额不能大于最高金额')
        return
      }
      if (this.merchantId === -1) {
        this.msgShow(this, '请选择所属商户')
        return
      }
      if (this.bannerImg.length > 0) {
        this.formObj.bannerIds = this.bannerImg.map(itm => itm.id).join(',')
      } else {
        delete this.formObj.bannerIds
        this.msgShow(this, '至少上传一张轮播图片')
        return
      }
      if (this.logoImg.id && this.logoImg.id > 0) {
        this.formObj.coverImages = Number(this.logoImg.id)
      } else {
        delete this.formObj.coverImages
      }
      if (this.shareImg.id && this.shareImg.id > 0) {
        this.formObj.shareImg = Number(this.shareImg.id)
      } else {
        delete this.formObj.shareImg
      }
      if (this.$route.query.type === 'edit') {
        delete this.formObj.updateAt
        delete this.formObj.createAt
        delete this.formObj.activities
      }
      delete this.formObj.banners
      this.formObj.merchant = this.merchantId
      this.formObj.platformRatio = this.platformRatio
      this.formObj.minSale = this.minSale
      this.formObj.maxSale = this.maxSale
      this.saveOrUpdate()
    },
    async productDetail() {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.productDetail + this.$route.query.id
        )
        if (data.return_code === 0) {
          this.formObj = data.obj
          this.merchantName = data.obj.merchant.name
          this.merchantId = data.obj.merchant.id
          if (this.formObj.coverImages)
            this.logoImg = Object.assign({}, this.formObj.coverImages)
          if (this.formObj.shareImg)
            this.shareImg = Object.assign({}, this.formObj.shareImg)
          if (this.formObj.banners.length > 0)
            this.bannerImg = Object.assign([], this.formObj.banners)
          if (this.formObj.intro) this.productRichContent = this.formObj.intro
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
          this.apiList.product,
          method,
          this.formObj
        )
        if (data.return_code === 0) {
          this.msgShow(
            this,
            `商品${this.$route.query.type === 'new' ? '保存' : '修改'}成功`,
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

<style lang="stylus" scoped>
</style>
