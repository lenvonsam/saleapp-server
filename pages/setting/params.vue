<template lang="pug">
.box
  i-box
    //- el-tag 佣金设置
    //- el-form.mt-15.w-66
      //- el-form-item
      //-   el-switch(active-text="按比例", inactive-text="按固定金额", v-model="switchToggle", @change="switchChange")
      //- template(v-if="switchToggle")
      //-   el-form-item(label="平台分佣")
      //-   el-slider(v-model="localObj.platformRatio")
      //-   //- el-form-item(label="客户分销分佣")
      //-   //- el-slider(v-model="localObj.saleRatio")
      //- template(v-else)
      //-   el-form-item(label="平台分佣")
      //-     el-input(type="number", placeholder="请输入分佣金额", v-model="localObj.platformRatio")
      //-       span(slot="append") 元
        //- el-form-item(label="客户分销分佣")
          el-input(type="number", placeholder="请输入分佣金额", v-model="localObj.saleRatio")
            span(slot="append") 元
    //- el-tag.mt-15 红包设置
    //- el-row.mt-15
    //-   el-col(:span="5")
    //-     label 1-5元
    //-     .mt-10
    //-       el-input-number(placeholder="请输入比例", :min="1", :max="10", v-model="rp1")
    //-   el-col(:span="5")
    //-     label 5-10元
    //-     .mt-10
    //-       el-input-number(placeholder="请输入比例", :min="1", :max="10", v-model="rp2")
    //-   el-col(:span="5")
    //-     label 10-15元
    //-     .mt-10
    //-       el-input-number(placeholder="请输入比例", :min="1", :max="10", v-model="rp3")
    //-   el-col(:span="5")
    //-     label 15-20元
    //-     .mt-10
    //-       el-input-number(placeholder="请输入比例", :min="1", :max="10", v-model="rp4")
    el-tag 平台客服
    el-form.mt-15.w-66
      el-form-item(label="客服二维码")
        single-pic-upload(v-model="wxImg", :extra="{ imgType: 'platform_wx_service' }")
    el-tag 返现设置
    el-form.mt-15.w-66
      el-form-item(label="返现天数")
        el-input(type="number", :step="1", placeholder="必须大于当天", v-model="localObj.backToMerchantTime", style="max-width: 300px")
          span(slot="prepend") T +
          span(slot="append") 天
    el-button.mt-15(@click="updateSys", type="primary") 保存



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
      localObj: {},
      switchToggle: false,
      rp1: 1,
      rp2: 1,
      rp3: 1,
      rp4: 1,
      wxImg: {}
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    switchChange() {
      this.localObj.platformRatio = 0
      this.localObj.saleRatio = 0
    },
    async loadData() {
      try {
        let { data } = await this.proxy(this, this.apiList.sysConfig, 'get', {
          bid: this.currentUser.currentBucket.id
        })
        if (data.return_code === 0) {
          this.localObj = data.obj
          this.rp1 = this.localObj.rpa1 || 1
          this.rp2 = this.localObj.rpa2 || 1
          this.rp3 = this.localObj.rpa3 || 1
          this.rp4 = this.localObj.rpa4 || 1
          this.switchToggle = this.localObj.commissionType === 1
          if (this.localObj.wxService)
            this.wxImg = Object.assign({}, this.localObj.wxService)
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async updateSys() {
      try {
        let total = this.localObj.platformRatio + this.localObj.saleRatio
        if (this.switchToggle && total > 100) {
          this.msgShow(this, '分佣比例不能超过100%')
          return
        }
        if (this.localObj.backToMerchantTime < 1) {
          this.msgShow(this, '返现天数不能小于当天')
          return
        }
        if (!(this.wxImg.id && this.wxImg.id > 0)) {
          this.msgShow(this, '平台客服不能为空')
          return
        }
        this.localObj.wxService = Number(this.wxImg.id)
        // delete this.localObj.wxService
        this.localObj.bucket = this.localObj.bucket.id || this.localObj.bucket
        this.localObj.rpa1 = this.rp1
        this.localObj.rpa2 = this.rp2
        this.localObj.rpa3 = this.rp3
        this.localObj.rpa4 = this.rp4
        delete this.localObj.updateAt
        delete this.localObj.createAt
        if (this.switchToggle) this.localObj.commissionType = 1
        else this.localObj.commissionType = 2
        let { data } = await this.proxy(
          this,
          this.apiList.sysConfig,
          'put',
          this.localObj
        )
        if (data.return_code === 0) {
          this.msgShow(this, '保存成功', 'success')
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
.w-66 {
  width: 66%;
}
</style>
