// 网络请求api列表
module.exports = {
  api() {
    return {
      login: '/backend/account/login',
      allBuckets: '/backend/account/allBuckets',
      accounts: '/backend/account',
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
      // 商户
      merchant: '/backend/account/merchant',
      merchantDetail: '/backend/account/merchant/',
      // 商品
      product: '/backend/product',
      productDetail: '/backend/product/',
      productBatchStatus: '/backend/product/batchStatus',
      productDropdown: '/backend/product/dropdown',
      // 系统设置
      banners: '/backend/setting/banners',
      bannerDelete: '/backend/setting/banners/',
      sysConfig: '/backend/setting/sysConfig'
    }
  }
}
