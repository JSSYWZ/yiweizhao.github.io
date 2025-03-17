document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 获取元素引用
    const resultsDiv = document.getElementById('results');
    const chartsDiv = document.getElementById('charts');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
        // 显示加载状态
        submitBtn.disabled = true;
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>数据分析中，请稍候...</p>
            </div>
        `;

        // 文件验证
        const deathsFile = document.getElementById('deathsFile').files[0];
        const populationFile = document.getElementById('populationFile').files[0];
        
        if (!deathsFile || !populationFile) {
            throw new Error('请同时上传两个文件');
        }

        if (!deathsFile.name.endsWith('.xlsx') || !populationFile.name.endsWith('.xlsx')) {
            throw new Error('仅支持.xlsx格式的Excel文件');
        }

        // 构建请求
        const formData = new FormData();
        formData.append('deaths', deathsFile);
        formData.append('population', populationFile);

        // 发送请求
        const response = await fetch('https://longevityprojection-523b352f8ede.herokuapp.com/api/analyze', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        });

        // 处理响应
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '未知服务器错误' }));
            throw new Error(`服务器错误: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        
        // 清除旧图表
        chartsDiv.innerHTML = `
            <div class="chart-container">
                <canvas id="cohortChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="ageEffectChart"></canvas>
            </div>
        `;

        // 显示结果
        document.getElementById('parameters').innerHTML = `
            <h3>拟合参数</h3>
            <pre>${JSON.stringify(result.parameters, null, 2)}</pre>
        `;

        // 渲染图表
        renderCharts(result.plots);

    } catch (error) {
        console.error('完整错误信息:', error);
        
        // 显示详细错误信息
        resultsDiv.innerHTML = `
            <div class="error-alert">
                <h3>分析失败</h3>
                <p>${error.message}</p>
                <button onclick="this.closest('.error-alert').remove();location.reload()">
                    重新尝试
                </button>
            </div>
        `;
        
        // 清除旧图表
        chartsDiv.innerHTML = '';
        
    } finally {
        submitBtn.disabled = false;
    }
});

// 图表实例缓存
let cohortChartInstance = null;
let ageEffectChartInstance = null;

function renderCharts(plotData) {
    // 销毁旧图表实例
    if (cohortChartInstance) cohortChartInstance.destroy();
    if (ageEffectChartInstance) ageEffectChartInstance.destroy();

    // 渲染队列效应图表
    cohortChartInstance = new Chart(document.getElementById('cohortChart'), {
        type: 'line',
        data: {
            labels: plotData.cohort.x,
            datasets: [{
                label: '队列效应',
                data: plotData.cohort.y,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '队列效应趋势分析'
                }
            }
        }
    });

    // 渲染年龄效应图表
    ageEffectChartInstance = new Chart(document.getElementById('ageEffectChart'), {
        type: 'bar',
        data: {
            labels: plotData.ageEffect.x,
            datasets: [{
                label: '年龄效应',
                data: plotData.ageEffect.y,
                backgroundColor: '#2196F3',
                borderColor: '#0D47A1',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '年龄效应分布'
                }
            }
        }
    });
}
