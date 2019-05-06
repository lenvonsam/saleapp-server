<template lang="pug">
.bk-sidebar(:class="{'toggle': navToggle}")
  el-menu(background-color="#42485b", text-color="#909399", active-text-color="#fff", router, :default-active="currentRouteIdx", :unique-opened="true", :collapse="navToggle", @select="menuSelect")
    template(v-for="(menu,idx) in currentMenus")
      template(v-if="menu.subItems")
        el-submenu(:index="menu.title")
          template(slot="title")
            i(v-if="menu.iconClass", :class="menu.iconClass")
            span {{menu.title}}
          el-menu-item(:index="(idx + 1) + '-' + (subIdx + 1)", :route="itm.url ? itm.url : '#'", v-for="(itm, subIdx) in menu.subItems", :key="subIdx") {{itm.title}}
      el-menu-item(:index="menu.title", :route="menu.url ? menu.url : '#'", v-else) {{menu.title}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState({
      navToggle: state => state.navToggle,
      currentMenus: state => state.currentMenus,
      currentRouteIdx: state => state.currentRouteIdx
    })
  },
  methods: {
    ...mapActions(['configVal']),
    menuSelect(val) {
      console.log('menu select', val)
      var arr = val.split('-')
      var parentIdx = Number(arr[0]) - 1
      var idx = Number(arr[1]) - 1
      console.log('currentMenu', this.currentMenus)
      console.log('parentindex:>>', parentIdx, '; idx:>>', idx)
      var currentObj = this.currentMenus[parentIdx]['subItems'][idx]
      console.log('obj', currentObj)
      this.configVal({
        key: 'currentTopTitle',
        val: currentObj.title
      })
      console.log('menu index:>', this.currentRouteIdx)
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
