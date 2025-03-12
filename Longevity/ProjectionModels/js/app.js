// 配置后端API地址（替换成你的Heroku应用地址）
const API_ENDPOINT = 'https://longevityprojection.herokuapp.com/api/analyze';

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
    // 验证输入
    if (!mortalityFile || !populationFile) {
      throw new Error('请上传两个Excel文件');
    }
    
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

    const result = await response.json();
    
    if (!response.ok) {
      // 处理自定义错误信息
      throw new Error(result.error || `请求失败: ${response.status}`);
    }

    // 显示结果
    document.getElementById('results').style.display = 'block';
    
    // 显示模型参数
    document.getElementById('parametersOutput').innerHTML = 
      `<pre>${JSON.stringify(result.parameters, null, 2)}</pre>`;
    
    // 显示交互式图表
    const plotContainer = document.getElementById('plotContainer');
    if (result.plot_html) {
      // 解码Base64并插入HTML
      const plotHtml = atob(result.plot_html);
      plotContainer.innerHTML = plotHtml;
      
      // 初始化Plotly交互功能
      if (window.Plotly) {
        Plotly.react('plotContainer', JSON.parse(plotHtml).data, JSON.parse(plotHtml).layout);
      }
    } else {
      plotContainer.innerHTML = '<p>无可用图表数据</p>';
    }
    
  } catch (error) {
    // 增强错误提示
    let errorMsg = error.message;
    if (error.message.includes('Failed to fetch')) {
      errorMsg = '无法连接服务器，请检查网络连接';
    }
    
    alert(`分析出错: ${errorMsg}`);
    console.error('详细错误:', error);
    
  } finally {
    showLoading(false);
  }
}

// 加载状态显示（保持原样）
function showLoading(isLoading) {
  const btn = document.querySelector('.analysis-btn');
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? 
    '<div class="loader"></div> 分析中...' : 
    '开始分析';
}
