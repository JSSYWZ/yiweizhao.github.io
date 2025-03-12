document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const deathFile = document.getElementById('deathFile').files[0];
    const populationFile = document.getElementById('populationFile').files[0];
    const model = document.getElementById('model').value;
    const ageRange = document.getElementById('ageRange').value;
    const yearRange = document.getElementById('yearRange').value;

    const formData = new FormData();
    formData.append('deathFile', deathFile);
    formData.append('populationFile', populationFile);
    formData.append('model', model);
    formData.append('ageRange', ageRange);
    formData.append('yearRange', yearRange);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('parameters').textContent = JSON.stringify(data.parameters, null, 2);
        // 假设返回的数据中包含图像的URL或Base64编码
        document.getElementById('plots').innerHTML = `<img src="${data.plotUrl}" alt="Plot">`;
    })
    .catch(error => console.error('Error:', error));
});
