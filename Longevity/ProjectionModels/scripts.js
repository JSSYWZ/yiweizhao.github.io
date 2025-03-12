async function analyzeData() {
  const formData = new FormData();
  formData.append('mortality', document.getElementById('mortality').files[0]);
  formData.append('population', document.getElementById('population').files[0]);
  formData.append('age', document.getElementById('ageRange').value);
  formData.append('year', document.getElementById('yearRange').value);
  formData.append('model', document.getElementById('modelSelect').value);

  try {
    const response = await fetch('https://your-heroku-app.herokuapp.com/api/analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    // 显示参数
    document.getElementById('parameters').innerHTML = `
      <h4>模型参数</h4>
      <pre>${JSON.stringify(data.parameters, null, 2)}</pre>
    `;
    
    // 显示图表
    document.getElementById('plots').innerHTML = `
      <img src="${data.plot_url}" alt="参数趋势图">
    `;
    
  } catch (error) {
    console.error('Error:', error);
  }
}
