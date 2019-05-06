export default function({ redirect, route, store }) {
  if (route.path === '/') redirect('/product')
}
