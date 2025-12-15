// Export utilities for winners list

export interface WinnerData {
  position: number
  name: string
}

// Export as Text/Notepad
export function exportAsText(winners: WinnerData[], drawInfo?: { date: string; numWinners: number }) {
  let content = "LUCKY DRAW WINNERS\n"
  content += "=".repeat(50) + "\n\n"
  
  if (drawInfo) {
    content += `Draw Date: ${drawInfo.date}\n`
    content += `Number of Winners: ${drawInfo.numWinners}\n\n`
  }
  
  content += "WINNERS LIST:\n"
  content += "-".repeat(50) + "\n"
  
  winners.forEach((winner) => {
    content += `${winner.position}. ${winner.name}\n`
  })
  
  const blob = new Blob([content], { type: "text/plain" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `winners-${new Date().toISOString().split("T")[0]}.txt`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Export as CSV/Excel
export function exportAsCSV(winners: WinnerData[], drawInfo?: { date: string; numWinners: number }) {
  const headers = ["Position", "Name"]
  const rows = winners.map((w) => [
    w.position.toString(),
    w.name,
  ])
  
  const csv = [
    drawInfo ? `Draw Date,${drawInfo.date}` : "",
    drawInfo ? `Number of Winners,${drawInfo.numWinners}` : "",
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].filter(Boolean).join("\n")
  
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `winners-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Export as Word Document (HTML format that Word can open)
export function exportAsWord(winners: WinnerData[], drawInfo?: { date: string; numWinners: number }) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Lucky Draw Winners</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Lucky Draw Winners</h1>
  ${drawInfo ? `<p><strong>Draw Date:</strong> ${drawInfo.date}</p><p><strong>Number of Winners:</strong> ${drawInfo.numWinners}</p>` : ""}
  <table>
    <thead>
      <tr>
        <th>Position</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
`
  
  winners.forEach((winner) => {
    html += `      <tr>
        <td>${winner.position}</td>
        <td>${winner.name}</td>
      </tr>
`
  })
  
  html += `    </tbody>
  </table>
</body>
</html>`
  
  const blob = new Blob([html], { type: "application/msword" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `winners-${new Date().toISOString().split("T")[0]}.doc`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Export as PDF (using browser print)
export function exportAsPDF(winners: WinnerData[], drawInfo?: { date: string; numWinners: number }) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Lucky Draw Winners</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
    }
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; margin-bottom: 20px; }
    .info { margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Lucky Draw Winners</h1>
  ${drawInfo ? `<div class="info"><p><strong>Draw Date:</strong> ${drawInfo.date}</p><p><strong>Number of Winners:</strong> ${drawInfo.numWinners}</p></div>` : ""}
  <table>
    <thead>
      <tr>
        <th>Position</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
`
  
  winners.forEach((winner) => {
    html += `      <tr>
        <td>${winner.position}</td>
        <td>${winner.name}</td>
      </tr>
`
  })
  
  html += `    </tbody>
  </table>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() {
        window.close();
      };
    };
  </script>
</body>
</html>`
  
  printWindow.document.write(html)
  printWindow.document.close()
}

