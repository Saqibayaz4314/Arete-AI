import axios from "axios";
import API_BASE from "../../../utils/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

/**
 * @description Generate an interview report based on the candidate's resume, self-description, and job description
 */

export const generateInterviewReport = async ({ resumeFile, selfDescription, jobDescription, targetCompany }) => {
  const formData = new FormData()
  formData.append("resume", resumeFile)
  formData.append("selfDescription", selfDescription || "")
  formData.append("jobDescription", jobDescription)
  if (targetCompany) {
    formData.append("targetCompany", targetCompany)
  }

  const response = await api.post("/api/interview", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return response.data
}


/**
 * @description Get the interview report by interviewId
 */

export const getInterviewReportById = async (interviewId) => {
  const response = await api.get(`/api/interview/report/${interviewId}`)
  return response.data
} 

/**
 * 
 * @description service to get all interview reports of logged in user
 */

export const getAllInterviewReports = async () => {
  const response = await api.get("/api/interview")
  return response.data
}