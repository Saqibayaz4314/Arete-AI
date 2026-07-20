import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router-dom"

const Protected = ({ children }) => {

  const {loading, user} = useAuth()

  if(loading){
    return (
      <div className="centered-loader" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-primary, #0f0d0b)", color: "var(--text-primary, #f5f0ea)" }}>
        <div className="loader-spinner" style={{ width: "40px", height: "40px", border: "3px solid rgba(232, 130, 58, 0.2)", borderTopColor: "#e8823a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        <p style={{ marginTop: "1rem", color: "#8c8278", fontSize: "0.9rem" }}>Authenticating session...</p>
      </div>
    )
  }
  if(!user){
    return <Navigate to={'/login'}/>
  }

  return children
}

export default Protected
