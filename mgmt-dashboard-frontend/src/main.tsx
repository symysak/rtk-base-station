import React from 'react'
import ReactDOM from 'react-dom/client'
import EasySettings from './pages/EasySettings.tsx'
import SateliteSelection from './pages/SateliteSelection.tsx'
import {
    createHashRouter,
    RouterProvider,
} from "react-router-dom";

const routes = [
    {
        path: "/",
        element: <EasySettings />,
    },
    {
        path: "satelite",
        element: <SateliteSelection />,
    },
];

const router = createHashRouter(routes,
{
}
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
