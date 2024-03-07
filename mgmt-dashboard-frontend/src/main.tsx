import React from 'react'
import ReactDOM from 'react-dom/client'
import EasySettings from './pages/EasySettings.tsx'
import SateliteSelection from './pages/SateliteSelection.tsx'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <EasySettings />,
    },
    {
        path: "/satelite",
        element: <SateliteSelection />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
