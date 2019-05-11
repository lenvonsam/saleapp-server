<template lang="pug">
.box
  .bg-white.padding
    div
      el-tag 基本信息
      .float-right
        el-button(size="small",@click="back") 返回列表
    detail-table.mt-15(:tableForm="tableFrom", :tableValue="formObj", v-if="formObj.id > 0")
    el-tag.mt-15 商品详情
    .mt-15.border.relative-position(style="height: 300px; overflow: hidden;")
      .padding-sm(style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: auto;", v-html="formObj.intro")
    template(v-if="formObj.id > 0")
      el-tag.mt-15 商品封面/分享图
      el-row.mt-15
        el-col(:span="12")
          .padding.text-center
            img(:src="formObj.coverImages.url")
          .text-center.mt-5 商品封面
        el-col(:span="12")
          template(v-if="formObj.shareImg")
            .padding.text-center
              img(:src="formObj.shareImg.url")
            .text-center.mt-5 商品分享图
          .text-center(v-else) 暂无
    el-tag.mt-15 商品轮播图
    .mt-15(style="width: 70%")
      el-carousel(indicator-position="none")
        el-carousel-item(v-for="item in formObj.banners" :key="item.id")
          img(:src="item.url", style="width: 100%;")
</template>

<script>
import detailTable from '@/components/DetailTable.vue'
import { mapActions, mapState } from 'vuex'
export default {
  layout: 'backend',
  components: {
    detailTable
  },
  data() {
    return {
      formObj: {},
      tableFrom: [
        [{ lbl: '标题', key: 'title' }, { lbl: '原价', key: 'originPrice' }],
        [
          { lbl: '副标题', key: 'subTitle' },
          { lbl: '折扣价', key: 'discountPrice' }
        ],
        [
          { lbl: '库存', key: 'stock' },
          {
            lbl: '所属商户',
            key: 'merchant',
            type: 'object',
            factValue(obj) {
              return obj.name
            }
          }
        ],
        [{ lbl: '访问量', key: 'pv' }, { lbl: '购买量', key: 'uv' }],
        [
          {
            lbl: '状态',
            type: 'self',
            factValue(self) {
              if (self.status === 0) {
                return '待上架'
              } else if (self.status === 1) {
                return '上架'
              } else {
                return '下架'
              }
            }
          },
          {
            lbl: '创建时间',
            key: 'createAt'
          }
        ]
      ]
    }
  },
  beforeMount() {
    this.$nextTick(function() {
      this.configVal({ key: 'currentTopTitle', val: '商品详情' })
      this.productDetail()
    })
  },
  methods: {
    ...mapActions(['configVal']),
    async productDetail() {
      try {
        let { data } = await this.proxy(
          this,
          this.apiList.productDetail + this.$route.query.id
        )
        if (data.return_code === 0) {
          this.formObj = Object.assign({}, data.obj)
          // this.merchantName = data.obj.merchant.name
          // this.merchantId = data.obj.merchant.id
          // if (this.formObj.coverImages)
          //   this.logoImg = Object.assign({}, this.formObj.coverImages)
          // if (this.formObj.shareImg)
          //   this.shareImg = Object.assign({}, this.formObj.shareImg)
          // if (this.formObj.banners.length > 0)
          //   this.bannerImg = Object.assign([], this.formObj.banners)
          // if (this.formObj.intro) this.productRichContent = this.formObj.intro
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
