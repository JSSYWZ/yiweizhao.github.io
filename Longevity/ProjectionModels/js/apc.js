document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const deathsFile = document.getElementById('deathsFile').files[0];
    const populationFile = document.getElementById('populationFile').files[0];

    // 创建FormData对象
    const formData = new FormData();
    formData.append('deaths', deathsFile);
    formData.append('population', populationFile);

    try {
        const response = await fetch('https://longevityprojection-523b352f8ede.herokuapp.com/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        // 显示参数
        document.getElementById('parameters').innerHTML = `
            <h3>拟合参数</h3>
            <pre>${JSON.stringify(result.parameters, null, 2)}</pre>
        `;

        // 绘制图表
        renderCharts(result.plots);
        
    } catch (error) {
        console.error('Error:', error);
        alert('分析失败，请检查文件格式和网络连接');
    }
});

function renderCharts(plotData) {
    // 示例：绘制队列效应图表
    new Chart(document.getElementById('cohortChart'), {
        type: 'line',
        data: {
            labels: plotData.cohort.x,
            datasets: [{
                label: '队列效应',
                data: plotData.cohort.y,
                borderColor: '#4CAF50'
            }]
        }
    });

    // 示例：绘制年龄效应图表
    new Chart(document.getElementById('ageEffectChart'), {
        type: 'bar',
        data: {
            labels: plotData.ageEffect.x,
            datasets: [{
                label: '年龄效应',
                data: plotData.ageEffect.y,
                backgroundColor: '#2196F3'
            }]
        }
    });
}
