declare module '*.less' {
  const classes: { [key: string]: string }
  export default classes
}

interface Window {
  __POWERED_BY_QIANKUN__?: boolean
  __REACT_DEVTOOLS_PLUS_INITIALIZED__?: boolean
}
