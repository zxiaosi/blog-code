import { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    //tmpl {% if(o.platform == 'A') { %}
    console.log('A环境');
    //tmpl {% } %}

    //tmpl {% if(o.platform == 'B') { %}
    console.log('B环境');
    //tmpl {% } %}
  }, []);

  return (
    <>
      {/* //tmpl {% if(o.platform == 'A') { %} */}
      <div>我是A环境</div>
      {/* //tmpl {% } %} */}

      {/* //tmpl {% if(o.platform == 'B') { %} */}
      <div>我是B环境</div>
      {/* //tmpl {% } %} */}
    </>
  );
}

export default App;
