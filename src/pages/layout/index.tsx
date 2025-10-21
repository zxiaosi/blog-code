import { Outlet } from 'react-router-dom';

const BaseLayout = () => {
  return (
    <div>
      BaseLayout
      <Outlet />
    </div>
  );
};

export default BaseLayout;
