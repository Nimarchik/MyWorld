import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import App from "./Page/home/App.jsx";
import Home from "./Page/Main/Home.jsx";

import Diary from "./Page/Diary/Diary.jsx";
import Statistic from "./Page/Statistic/Statistic.jsx";
import Memories from "./Page/Memories/Memories.jsx";
import Oracle from "./Page/Oracle/Oracle.jsx";
import { createHashRouter } from "react-router";
import "./registerSW";
import Movies from "./Page/Movies/Movies.jsx";
import { AchievementProvider } from "./context/AchievementContext.jsx";


const router = createHashRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          element: <Home />,
          children: [

          ],

        },
        {
          index: true,
          element: <Navigate to="/Main" replace />,
        },
        {
          path: "/Main",
          element: <Statistic />,
        },
        {
          path: "/Diary",
          element: <Diary />,
        },
        {
          path: "/Memories",
          element: <Memories />,
        },
        {
          path: "/Oracle",
          element: <Oracle />,
        },
        {
          path: "/Movies",
          element: <Movies />,
        },
      ],
    },
  ]
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AchievementProvider>
      <RouterProvider router={router} />
    </AchievementProvider>
  </StrictMode>
);