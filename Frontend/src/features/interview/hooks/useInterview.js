import { generateInterviewReport, getInterviewReportById, getAllInterviewReports } from "../service/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"

export const useInterview = () => {
  const context = useContext(InterviewContext)
  if(!context){
    throw new Error("useInterview must be used within an InterviewProvider") 
  }
  const {loading, setLoading, report, setReport, reports, setReports} = context
  const generateReport = async ({resumeFile, selfDescription, jobDescription}) => {
    setLoading(true)
    try{
      const response = await generateInterviewReport({resumeFile, selfDescription, jobDescription})
      setReport(response.interviewReport)
    }catch(error){
      console.error("Error generating interview report:", error)
    }finally{
      setLoading(false)
    }
  }

  const getReportById = async (interviewId) => {
    setLoading(true)
    try{
      const response = await getInterviewReportById(interviewId)
      setReport(response.interviewReport)
    }catch(error){
      console.error("Error fetching interview report by ID:", error)
    }finally{
      setLoading(false)
    }
  }

  const getReports = async () => {
    setLoading(true)
    try{
      const response = await getAllInterviewReports()
      setReports(response.interviewReports)
    }catch(error){
      console.error("Error fetching all interview reports:", error)
    } finally{
      setLoading(false)
    }
  }

  return {loading, report, reports, generateReport, getReportById, getReports}
}