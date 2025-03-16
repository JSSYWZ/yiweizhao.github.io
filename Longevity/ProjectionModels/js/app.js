// 配置后端API地址（替换成你的Heroku应用地址）
const API_ENDPOINT = 'https://longevityprojection-523b352f8ede.herokuapp.com/api/analyze';

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

    // 验证文件类型和大小
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(mortalityFile.type) {
      throw new Error('死亡率文件必须是Excel格式');
    }
    if (!allowedTypes.includes(populationFile.type)) {
      throw new Error('人口文件必须是Excel格式');
    }
    if (mortalityFile.size > maxFileSize || populationFile.size > maxFileSize) {
      throw new Error('文件大小不能超过10MB');
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append('mortality', mortalityFile);
    formData.append('population', populationFile);
    formData.append('age', ageRange);
    formData.append('year', yearRange);
    formData.append('model', modelType);

    // 发送请求（添加超时处理）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // 清除超时

    // 处理响应
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error('服务器返回了无效的响应格式');
    }

    if (!response.ok) {
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
      try {
        // 尝试解码Base64（如果失败，直接使用原始HTML）
        const plotHtml = atob(result.plot_html);
        plotContainer.innerHTML = plotHtml;

        // 初始化Plotly交互功能
        if (window.Plotly) {
          Plotly.react('plotContainer', JSON.parse(plotHtml).data, JSON.parse(plotHtml).layout);
        }
      } catch (error) {
        // 如果解码失败，直接使用原始HTML
        plotContainer.innerHTML = result.plot_html;
      }
    } else {
      plotContainer.innerHTML = '<p>无可用图表数据</p>';
    }

  } catch (error) {
    // 增强错误提示
    let errorMsg = error.message;
    if (error.message.includes('Failed to fetch')) {
      errorMsg = '无法连接服务器，请检查网络连接';
    } else if (error.name === 'AbortError') {
      errorMsg = '请求超时，请稍后重试';
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
