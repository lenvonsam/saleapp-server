import _ from 'lodash'
export default async function({ redirect, route, store }) {
  if (store.state.user.isLogin) {
    let menus = []
    if (store.state.user.currentUser.acctLevel === 3) {
      menus = store.state.allMenus
    } else {
      // 设置用户的菜单
      const userAuths = store.state.user.currentUser.auths
      const userAuthGroup = _.groupBy(userAuths, itm => {
        return itm.menu.parent.factOrder
      })
      let currentMenus = []
      Object.keys(userAuthGroup).map(k => {
        let groupAuth = userAuthGroup[k]
        let firstMenu = {
          title: groupAuth[0].menu.parent.name,
          iconClass: groupAuth[0].menu.parent.iconName
        }
        let allMenus = []
        groupAuth.map(itm => {
          allMenus.push(itm.menu)
        })
        allMenus = _.orderBy(allMenus, ['factOrder', 'asc'])
        let secMenus = []
        allMenus.map(itm => {
          let secMenu = {
            title: itm.name,
            url: itm.path
          }
          secMenus.push(secMenu)
        })
        firstMenu.subItems = secMenus
        currentMenus.push(firstMenu)
      })
      menus = currentMenus
    }
    store.state.currentMenus = menus
    console.log('currentMenus:>>', store.state.currentMenus)
    console.log(route.path)
    for (var i = 0; i < menus.length; i++) {
      let tempSubs = menus[i].subItems
      console.log('idx:>>', i, '; subs:>>', tempSubs)
      let idx = tempSubs.findIndex(itm => route.path.startsWith(itm.url))
      console.log('menu index:>>' + idx)
      if (idx >= 0) {
        store.state.currentTopTitle = tempSubs[idx].title
        store.state.currentRouteIdx = i + 1 + '-' + (idx + 1)
        break
      }
    }
  } else {
    if (!store.state.user.isLogin && route.path !== '/login') {
      redirect('/login')
    }
  }
}
