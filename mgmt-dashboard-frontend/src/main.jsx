import React from 'react'
import ReactDOM from 'react-dom/client'
import Status from './pages/Status.jsx'
import EasySettings from './pages/EasySettings.jsx'
import SateliteSelection from './pages/SateliteSelection.jsx'
import {
    createHashRouter,
    RouterProvider,
} from "react-router-dom";

const routes = [
    {
        path: "/",
        element: <Status />,
    },
    {
        path: "/easy-settings",
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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
