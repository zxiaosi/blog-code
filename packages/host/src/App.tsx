import './App.css';
import React from 'react';

const CustomButton = React.lazy(() => import('remote/CustomButton'));

function App() {
  return (
    <>
      <CustomButton text="Hello Host" />
    </>
  );
}

export default App;
