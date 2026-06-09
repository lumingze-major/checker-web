import { useState } from 'react'
import Layout from './components/Layout'
import ReportList from './pages/ReportList'
import CompareDetail from './pages/CompareDetail'
import TemplateManage from './pages/TemplateManage'
import ToastContainer, { showToast } from './components/Toast'
import { reports as initialReports } from './data/mock'
import type { CompareReport } from './types'

type Page = 'reports' | 'templates'

export default function App() {
  const [page, setPage] = useState<Page>('reports')
  const [selectedReport, setSelectedReport] = useState<CompareReport | null>(null)
  const [reports, setReports] = useState<CompareReport[]>(initialReports)

  const handleViewReport = (report: CompareReport) => {
    setSelectedReport(report)
  }

  const handleBack = () => {
    setSelectedReport(null)
  }

  const handleAddReport = (report: CompareReport) => {
    setReports(prev => {
      const exists = prev.find(r => r.id === report.id)
      if (exists) {
        return prev.map(r => r.id === report.id ? report : r)
      }
      return [report, ...prev]
    })
  }

  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
    showToast('success', '报告已删除')
  }

  const handleRenameReport = (id: string, name: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, name } : r))
    showToast('success', '报告已重命名')
  }

  const content = selectedReport ? (
    <CompareDetail
      report={selectedReport}
      onBack={handleBack}
    />
  ) : (
    <>
      {page === 'reports' && (
        <ReportList
          reports={reports}
          onViewReport={handleViewReport}
          onAddReport={handleAddReport}
          onDeleteReport={handleDeleteReport}
          onRenameReport={handleRenameReport}
        />
      )}
      {page === 'templates' && <TemplateManage />}
    </>
  )

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {content}
      <ToastContainer />
    </Layout>
  )
}
