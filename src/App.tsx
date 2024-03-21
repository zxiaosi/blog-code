import { useState } from 'react';
import './App.css';
import CustomEditor from './components/CustomEditor';

function App() {
  const [value, setValue] = useState('');

  return (
    <div className="page">
      <CustomEditor height={500} value={value} onchangeValue={setValue} />
    </div>
  );
}

export default App;
