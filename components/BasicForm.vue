<template lang="pug">
el-form(:model="localForm",:rules="basicformConfig.rules", :label-width="labelWidth", ref="basicForm")
  el-form-item(:label="head.labelName", :prop="head.propName", v-for="(head,idx) in basicformConfig.formHeader", :key="idx")
    el-input(v-model="localForm[head.propName]", v-if="head.type == 'input'", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)")
    el-input(v-model="localForm[head.propName]", v-else-if="head.type == 'textarea'", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)", type="textarea", :rows="5")
    el-date-picker(v-model="localForm[head.propName]", v-else-if="head.type == 'date'", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)", type="date", format="yyyy-MM-dd", value-format="yyyy-MM-dd", @change="datepickerChange")
    el-date-picker(v-model="localForm[head.propName]", v-else-if="head.type == 'datetime'", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)", type="datetime", format="yyyy-MM-dd HH:mm:ss", value-format="yyyy-MM-dd HH:mm:ss", @change="datepickerChange")
    el-input(v-model="localForm[head.propName]", v-else-if="head.type == 'password'", type="password", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)")
    el-input(v-model="localForm[head.propName]", v-else-if="head.type == 'inputNumber'", type="number", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)")
    el-select(v-model="localForm[head.propName]", v-else-if="(head.type == 'select' && (head.dataType == 'api' || head.dataType == 'globalArray'))", :style="{'width': head.width || '70%'}", :placeholder="'请选择' + (head.placeholder || head.labelName)")
      el-option(v-for="(opts,idx) in localForm[head.listName]", :key="idx", :label="opts[head.optLbl]", :value="opts[head.optKey]")
    el-select(v-model="localForm[head.propName]", v-else-if="(head.type == 'select' && head.dataType == 'array')", :style="{'width': head.width || '70%'}", :placeholder="'请选择' + (head.placeholder || head.labelName)")
      el-option(v-if="head.dataType == 'array'", v-for="(opts, idx) in head.listArray", :key="idx", :label="opts[head.optLbl]", :value="opts[head.optKey]")
    template(v-else-if="head.type == 'iptIconExample'")
      el-input(v-model="localForm[head.propName]", :style="{'width': head.width || '70%'}", :placeholder="'请输入' + (head.placeholder || head.labelName)")
      el-button.ml-20(size="medium", type="text", @click="openIconSite") 图标参考
  slot(name="append")
  el-form-item
    el-button(type="primary", @click="submitForm('articleForm')") 保存
    el-button(@click="cancelBtn") 取消
</template>

<script>
export default {
  props: {
    basicformConfig: {
      type: Object,
      required: true
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    formCancel: {
      type: null,
      default: false
    },
    resetForm: {
      type: Boolean,
      default: false
    },
    modelForm: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localForm: {}
    }
  },
  watch: {
    resetForm(newVal, oldVal) {
      console.log('form reset', newVal)
      if (newVal) this.$refs['basicForm'].resetFields()
    },
    modelForm: {
      handler: function(newVal, oldVal) {
        console.log('form value change')
        let keys = Object.keys(newVal)
        if (keys.length == 0) {
          Object.keys(this.localForm).map(itm => {
            this.localForm[itm] = ''
          })
        } else {
          console.log('keys:>>', keys)
          keys.map(itm => {
            this.localForm[itm] = newVal[itm]
          })
          this.$forceUpdate()
          console.log('after change :>>', this.localForm)
        }
      },
      deep: true
    }
  },
  beforeMount() {
    console.log('beforeMount basicform', this.modelForm)
    this.$nextTick(function() {
      this.localForm = Object.assign({}, this.modelForm)
      let selectConfigArr = this.basicformConfig.formHeader.filter(
        itm =>
          itm.type == 'select' &&
          (itm.dataType == 'api' || itm.dataType == 'globalArray')
      )
      if (selectConfigArr.length > 0) {
        const me = this
        // this.localForm = Object.assign({}, this.modelForm)
        selectConfigArr.map(itm => {
          if (!me.localForm[itm.listName]) {
            me.localForm[itm.listName] = []
            if (itm.dataType === 'api') me.getSelectVal(itm)
            if (itm.dataType === 'globalArray') me.getGlobalSelectVal(itm)
          }
        })
      }
      this.$forceUpdate()
    })
  },
  methods: {
    datepickerChange(dateval) {
      console.log(dateval)
      this.$forceUpdate()
    },
    openIconSite() {
      window.open('http://www.fontawesome.com.cn/faicons/', '_blank')
    },
    resetFormValue() {
      Object.keys(this.localForm).map(itm => {
        this.localForm[itm] = ''
      })
    },
    async submitForm() {
      try {
        console.log('localform:>>', this.localForm)
        await this.formValidate(this, 'basicForm')
        const me = this
        this.$emit('formSubmit', this.localForm)
      } catch (e) {
        console.error(e)
        // this.pageLoad.close()
      }
    },
    async getSelectVal(itm) {
      try {
        let { data } = await this.proxy(this, itm.dataUrl)
        console.log('sss list', data.list)
        this.localForm[itm.listName] = data.list
        console.log('localForm:>>', this.localForm)
        this.$forceUpdate()
      } catch (e) {
        console.log('ssss')
      }
    },
    getGlobalSelectVal(itm) {
      this.localForm[itm.listName] = itm.globalValue(this)
    },
    cancelBtn() {
      this.formCancel ? this.formCancel() : this.back()
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
