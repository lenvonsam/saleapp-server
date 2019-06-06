export default () => ({
  navToggle: false,
  pageSize: 8,
  fileUploadUrl: '/fileUpload',
  globalSuccessMsg: '',
  globalErrorMsg: '',
  currentRouteIdx: '1-1',
  currentMenus: [],
  currentTopTitle: '',
  allMenus: [
    {
      title: '商品管理',
      iconClass: 'el-icon-goods',
      subItems: [
        {
          title: '商品信息',
          url: '/product'
        }
      ]
    },
    {
      title: '活动管理',
      iconClass: 'fa fa-superpowers',
      subItems: [
        {
          title: '活动列表',
          url: '/activity'
        },
        {
          title: '活动大类',
          url: '/classify'
        },
        {
          title: '创建活动',
          url: '/activity/createForm'
        }
      ]
    },
    {
      title: '用户管理',
      iconClass: 'fa fa-user-circle-o',
      subItems: [
        {
          title: '会员信息',
          url: '/user'
        }
      ]
    },
    {
      title: '商户管理',
      iconClass: 'fa fa-handshake-o',
      subItems: [
        { title: '商户信息', url: '/merchant' },
        { title: '提现管理', url: '/withdraw' }
      ]
    },
    {
      title: '订单管理',
      iconClass: 'fa fa-map-o',
      subItems: [{ title: '用户订单', url: '/bill' }]
    },
    {
      title: '系统设置',
      iconClass: 'el-icon-setting',
      subItems: [
        { title: '轮播图片', url: '/setting/banner' },
        { title: '参数设置', url: '/setting/params' }
      ]
    }
  ]
})
