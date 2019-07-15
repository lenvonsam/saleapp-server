// 网络请求api列表
module.exports = {
  api() {
    return {
      login: '/backend/account/login',
      allBuckets: '/backend/account/allBuckets',
      accounts: '/backend/account',
      accountUsers: '/backend/account/users',
      accountWithdraw: '/backend/account/withdraw',
      accountWithdrawStatus: '/backend/account/withdrawStatus',
      accountWithdrawTrans: '/backend/account/$/withdraw',
      accountWithdrawExcel: '/backend/account/withdrawExcel',
      accountTrans: '/backend/account/$/trans',
      menus: '/backend/menu',
      parentMenus: '/backend/menu/parentMenus',
      menuCreate: '/backend/menu/create',
      menuUpdate: '/backend/menu/update',
      roles: '/backend/role',
      roleCreate: '/backend/role/create',
      roleUpdate: '/backend/role/update',
      roleMenus: '/backend/role/menus',
      roleAuths: '/backend/role/auths',
      roleBucket: '/backend/role/bucket',
      // 活动大类
      classify: '/backend/activity/classify',
      activity: '/backend/activity',
      activityDetail: '/backend/activity/',
      activityAddProduct: '/backend/activity/addProducts',
      acitvityProducts: '/backend/activity/$/products',
      activityDropdown: '/backend/activity/dropdown',
      activityBatchStatus: '/backend/activity/batchStatus',
      activityForm: '/backend/activity/form',
      activityFormExcel: '/backend/activity/formExcel',
      activityProductDel: '/backend/activity/$/product',
      activityProductLimitUpdate: '/backend/activity/$/product/limit',
      // 商户
      merchant: '/backend/account/merchant',
      merchantDetail: '/backend/account/merchant/',
      // 商品
      product: '/backend/product',
      productDetail: '/backend/product/',
      productBatchStatus: '/backend/product/batchStatus',
      productDropdown: '/backend/product/dropdown',
      productComment: '/backend/product/comment',
      productComments: '/backend/product/$/comment',
      // 系统设置
      banners: '/backend/setting/banners',
      // bannerDelete: '/backend/setting/banners/',
      sysConfig: '/backend/setting/sysConfig',
      // 订单
      bill: '/backend/bill',
      billExcel: '/backend/bill/excel',
      billUpdateStatus: '/backend/bill/$/status'
    }
  }
}
