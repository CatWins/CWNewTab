export interface IFocusable {
  id: string,
  zIndex: number,

  focus: () => void,
  unfocus: () => void,
  isFocused: () => boolean
}
