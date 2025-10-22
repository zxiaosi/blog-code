import { Button } from 'antd';

const About = () => {
  /** js错误 */
  const handleJsError = () => {
    var num = new Number(12.34);
    console.log(num.toFixed(-1));
  };

  return (
    <div>
      <h1>This is an about page</h1>
      <Button type="primary" onClick={handleJsError}>
        js错误
      </Button>
    </div>
  );
};

export default About;
