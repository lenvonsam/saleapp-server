<template lang="pug">
.box
  i-box
    el-tag 佣金设置
    el-form.mt-15.w-66
      el-form-item
        el-switch(active-text="按比例", inactive-text="按固定金额", v-model="switchToggle", @change="switchChange")
      template(v-if="switchToggle")
        el-form-item(label="平台分佣")
        el-slider(v-model="localObj.platformRatio")
        el-form-item(label="客户分销分佣")
        el-slider(v-model="localObj.saleRatio")
      template(v-else)
        el-form-item(label="平台分佣")
          el-input(type="number", placeholder="请输入分佣金额", v-model="localObj.platformRatio")
            span(slot="append") 元
        el-form-item(label="客户分销分佣")
          el-input(type="number", placeholder="请输入分佣金额", v-model="localObj.saleRatio")
            span(slot="append") 元
    el-tag.mt-15 返现设置
    el-form.mt-15.w-66
      el-form-item(label="返现天数")
        el-input(type="number", :step="1", placeholder="必须大于当天", v-model="localObj.backToMerchantTime")
          span(slot="prepend") T +
          span(slot="append") 天
    el-button.mt-15(@click="updateSys", type="primary") 保存



</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      localObj: {},
      switchToggle: false
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
          this.switchToggle = this.localObj.commissionType === 1
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
        this.localObj.bucket = this.localObj.bucket.id
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
