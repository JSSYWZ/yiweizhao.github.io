// 配置后端API地址（替换成你的Heroku应用地址）
const API_ENDPOINT = 'https://your-heroku-app.herokuapp.com/api/analyze';

async function startAnalysis() {
  // 获取表单元素
  const mortalityFile = document.getElementById('mortalityFile').files[0];
  const populationFile = document.getElementById('populationFile').files[0];
  const ageRange = document.getElementById('ageRange').value;
  const yearRange = document.getElementById('yearRange').value;
  const modelType = document.getElementById('modelSelect').value;

  // 显示加载状态
  showLoading(true);

  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('mortality', mortalityFile);
    formData.append('population', populationFile);
    formData.append('age', ageRange);
    formData.append('year', yearRange);
    formData.append('model', modelType);

    // 发送请求
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const result = await response.json();
    
    // 显示结果
    document.getElementById('results').style.display = 'block';
    document.getElementById('parametersOutput').textContent = 
      JSON.stringify(result.parameters, null, 2);
    
    // 显示图表（假设返回的是Base64图片）
    if (result.plot_url) {
      const plotContainer = document.getElementById('plotContainer');
      plotContainer.innerHTML = `<img src="${result.plot_url}" 
        alt="分析图表" class="result-plot">`;
    }
    
  } catch (error) {
    alert(`分析出错: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// 加载状态显示
function showLoading(isLoading) {
  const btn = document.querySelector('.analysis-btn');
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? 
    '<div class="loader"></div> 分析中...' : 
    '开始分析';
}
