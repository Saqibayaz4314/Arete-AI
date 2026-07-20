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

export const router = createBrowserRouter([
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
    path: "/",
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