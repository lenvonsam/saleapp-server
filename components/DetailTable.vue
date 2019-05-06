<template lang="pug">
  table.detail-table
    tbody
      template(v-for="fitem in tableForm")
        tr
          td.title {{fitem[0].lbl}}
          template(v-if="fitem[0].type == 'object'")
            td.content {{fitem[0].factValue(tableValue[fitem[0].key])}}
          template(v-else-if="fitem[0].type == 'self'")
            td.content {{fitem[0].factValue(tableValue)}}
          template(v-else)
            td.content {{tableValue[fitem[0].key] | rowData(fitem[0].key)}}
          template(v-if="fitem.length == 2")
            td.title {{fitem[1].lbl}}
            template(v-if="fitem[1].type == 'object'")
              td.content {{fitem[1].factValue(tableValue[fitem[1].key])}}
            template(v-else-if="fitem[1].type == 'self'")
              td.content {{fitem[1].factValue(tableValue)}}
            template(v-else)
              td.content {{tableValue[fitem[1].key] | rowData(fitem[1].key)}}
          template(v-else)
            td.title
            td.content

</template>

<script>
export default {
  props: {
    tableForm: {
      type: Array,
      required: true
    },
    tableValue: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus", scoped>
@import '../assets/stylus/color';

table.detail-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;

  td {
    border: 1px solid #ddd;
  }

  tr, td {
    line-height: 50px;
    height: 50px;
  }

  td.title {
    width: 20%;
    background-color: $color-main-l;
  }
  td.content {
    width: 30%;
  }
}
</style>
