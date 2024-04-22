import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query'
import { HomePage } from "./pages/HomePage";
import { queryClient } from './lib/utils';
import { Toaster } from 'react-hot-toast';
import './styles/global.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
    />
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
