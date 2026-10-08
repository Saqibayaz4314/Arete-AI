import { createBrowserRouter } from "react-router-dom"
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import Protected from "./features/auth/components/Protected"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/interview"
import Dashboard from "./features/interview/pages/Dashboard"
import MockInterview from "./features/interview/pages/MockInterview"
import MarketingLayout from "./features/marketing/MarketingLayout"
import Landing from "./features/marketing/Landing"
import Features from "./features/marketing/Features"
import Docs from "./features/marketing/Docs"
import Pricing from "./features/marketing/Pricing"

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/features", element: <Features /> },
      { path: "/docs", element: <Docs /> },
      { path: "/pricing", element: <Pricing /> }
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />
  },
  {
    path: "/app",
    element: <Protected><Home /></Protected>
  },
  {
    path: "/interview/:interviewId",
    element: <Protected><Interview /></Protected>
  },
  {
    path: "/interview/:interviewId/mock",
    element: <Protected><MockInterview /></Protected>
  },
  {
    path: "/dashboard",
    element: <Protected><Dashboard /></Protected>
  }
])