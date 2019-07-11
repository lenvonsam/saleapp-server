<template lang="pug">
.box 
  b-table(:tableValue="tableValue", @rowEdit="tableRowEdit", :rightPart="false", @actionBtnClick="actionBtns", :total="total", @chooseData="chooseItems", @pageChange="pgChange")
  el-dialog(:visible.sync="dialogShow")
    template(v-if="rowType == 'addComment'")
      el-form(style="width: 60%;margin-left: 5%", :model="commentObj", :rules="commentRuels", ref="commentForm")
        el-form-item(label="昵称", prop="nickname")
          el-input(placeholder="评论者昵称", v-model="commentObj.nickname")
        el-form-item(label="头像", prop="urlObj", required)
          single-pic-upload(v-model="commentObj.urlObj", :extra="{imgType: 'comment'}")
        el-form-item(label="内容", prop="content")
          el-input(type="textarea", placeholder="评论内容", :rows="5", v-model="commentObj.content")
    template(v-else-if="rowType == 'comments'")
      b-table(:tableValue="productComments", :rightPart="false")
    div(slot="footer")
      el-button(@click="dialogShow = false") 取消
      el-button(type="primary", @click="dialogConfirm") 确定
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
    var urlObjValidate = (rule, value, callback) => {
      if (value.id && value.id > 0) {
        callback()
      } else {
        callback(new Error('请上传头像图片'))
      }
    }
    return {
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'create'
          },
          {
            lbl: '批量上架',
            type: 'batchUp'
          },
          {
            lbl: '批量下架',
            type: 'batchDown'
          }
        ],
        hasCbx: true,
        tableHead: [
          {
            lbl: '封面图',
            type: 'image',
            prop: 'coverImages',
            factValue(row) {
              return row.url
            }
          },
          {
            lbl: '主标题',
            prop: 'title'
          },
          {
            lbl: '库存',
            prop: 'stock'
          },
          {
            lbl: '原价',
            prop: 'originPrice'
          },
          {
            lbl: '折扣价',
            prop: 'discountPrice'
          },
          // {
          //   lbl: '类型',
          //   prop: 'type',
          //   type: 'object',
          //   factValue(row) {
          //     if (row.type === 1) {
          //       return '引流'
          //     } else if (row.type === 2) {
          //       return '普通(非物流)'
          //     } else {
          //       return '普通物流'
          //     }
          //   }
          // },
          {
            lbl: '访问量',
            prop: 'pv'
          },
          {
            lbl: '购买量',
            prop: 'uv'
          },
          {
            lbl: '启用状态',
            type: 'object',
            factValue(row) {
              if (row.status === 0) {
                return '待上架'
              } else if (row.status === 1) {
                return '已上架'
              } else {
                return '已下架'
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
                lbl: '详情',
                type: 'info'
              }
              // {
              //   lbl: '添加评论',
              //   type: 'addComment'
              // },
              // {
              //   lbl: '评论列表',
              //   type: 'comments'
              // }
            ]
          }
        ],
        tableData: []
      },
      currentPage: 1,
      total: 0,
      chooseProducts: [],
      dialogShow: false,
      rowType: '',
      rowObj: {},
      commentObj: {
        nickname: '',
        urlObj: {},
        content: ''
      },
      commentRuels: {
        nickname: [
          { required: true, message: '评论者昵称能为空', trigger: 'blur' }
        ],
        urlObj: [{ validator: urlObjValidate, trigger: 'submit' }],
        content: [
          { required: true, message: '评论内容不能为空', trigger: 'blur' }
        ]
      },
      productComments: {
        tableData: [],
        hasCbx: false,
        tableHead: [
          {
            lbl: '昵称',
            prop: 'nickname'
          },
          {
            lbl: '头像',
            type: 'image',
            prop: 'avatarUrl',
            factValue(val) {
              return val
            }
          },
          {
            lbl: '内容',
            prop: 'content'
          }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      pageSize: state => state.pageSize
    })
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    pgChange(val) {
      this.currentPage = val
      this.loadData()
    },
    chooseItems(val) {
      console.log('items:>>', val)
      this.chooseProducts = val
    },
    actionBtns(type) {
      if (type === 'create') {
        this.jump({ path: '/product/form?type=new' })
      } else if (type === 'batchUp' || type === 'batchDown') {
        console.log(type)
        if (this.chooseProducts.length === 0) {
          this.msgShow(this, '请选择要操作的行')
        } else {
          let action = type == 'batchUp' ? 1 : 2
          this.batchUpdate(action)
        }
      }
    },
    async batchUpdate(mark) {
      try {
        let ids = this.chooseProducts.map(itm => itm.id).join(',')
        let { data } = await this.proxy(
          this,
          this.apiList.productBatchStatus,
          'put',
          {
            mark,
            ids
          }
        )
        if (data.return_code === 0) {
          this.msgShow(this, '操作成功', 'success')
          this.currentPage = 0
          this.loadData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    tableRowEdit(idx, row, type) {
      this.rowType = type
      this.rowObj = row
      if (type === 'edit') {
        if (row.status === 1) {
          this.msgShow(this, '上架的商品无法修改')
          return
        }
        this.jump({ path: '/product/form?type=edit&id=' + row.id })
      } else if (type === 'info') {
        this.jump({ path: '/product/detail?id=' + row.id })
      } else if (type === 'addComment') {
        // 重置commentobj
        this.commentObj = {
          nickname: '',
          urlObj: {},
          content: ''
        }
        this.dialogShow = true
      } else if (type === 'comments') {
        this.dialogShow = true
        this.loadComments(row.id)
      }
    },
    async loadComments(pid) {
      try {
        let url = this.apiList.productComments.replace('$', pid)
        let { data } = await this.proxy(this, url, 'get', {
          currentPage: 0,
          pageSize: 5
        })
        if (data.return_code === 0) {
          this.productComments.tableData = data.list
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
      }
    },
    async loadData() {
      try {
        this.pageShow(this)
        let body = {
          currentPage: this.currentPage - 1,
          pageSize: this.pageSize
        }
        let { data } = await this.proxy(this, this.apiList.product, 'get', body)
        this.pageHide(this)
        if (data.list.length > 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
        } else {
          if (data.return_code != 0) this.msgShow(this, data.message)
        }
      } catch (e) {
        this.pageHide(this)
        console.log(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    dialogConfirm() {
      const me = this
      if (this.rowType === 'addComment') {
        this.formValidate(this, 'commentForm')
          .then(res => {
            me.postComment()
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    async postComment() {
      try {
        let body = Object.assign({}, this.commentObj)
        body.avatarUrl = body.urlObj.url
        delete body.urlObj
        body.product = this.rowObj.id
        let { data } = await this.proxy(
          this,
          this.apiList.productComment,
          'post',
          body
        )
        this.dialogShow = false
        if (data.return_code === 0) {
          this.msgShow(this, '评论创建成功', 'success')
        } else {
          this.msgShow(this, data.message)
        }
      } catch (err) {
        console.log(err)
        this.dialogShow = false
        this.msgShow(this, err.message || '网络异常')
      }
    }
  }
}
</script>
