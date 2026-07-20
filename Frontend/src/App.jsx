import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes"
import { AuthProvider } from "./features/auth/auth.context"
import { InterviewProvider } from "./features/interview/interview.context"
import { ToastProvider } from "./context/ToastContext"

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
