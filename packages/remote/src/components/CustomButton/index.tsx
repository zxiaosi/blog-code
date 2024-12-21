interface Props {
  /** 按钮文案 */
  text?: string;
  /** 按钮点击事件 */
  onClick?: () => void;
  /** 按钮样式 */
  style?: React.CSSProperties;
  /** 按钮类名 */
  className?: string;
}

/** 自定义按钮 */
const CustomButton = (props: Props) => {
  const { text, ...rest } = props;
  return <button {...rest}>{text}</button>;
};

export default CustomButton;
