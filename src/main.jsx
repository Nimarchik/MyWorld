import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from './Page/home/App.jsx'
import Home from './Page/Main/Home.jsx';
import Diary from './Page/Diary/Diary.jsx';
import Statistic from './Page/Statistic/Statistic.jsx';
import Memories from './Page/Memories/Memories.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: '/Home',
        element: <Home />
      },
      {
        path: '/Diary',
        element: <Diary />
      },
      {
        path: 'Main',
        element: <Statistic />
      },
      {
        path: '/Memories',
        element: <Memories />
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />,
  </StrictMode>,
)
