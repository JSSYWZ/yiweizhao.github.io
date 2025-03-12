import os
from flask import Flask, render_template, request
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.formula.api import glm
from statsmodels.genmod.families import Poisson

app = Flask(__name__)

# 获取项目根目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 设置上传文件夹路径
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
# 设置静态文件夹路径
app.config['STATIC_FOLDER'] = os.path.join(BASE_DIR, 'static')

# 创建文件夹
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['STATIC_FOLDER'], exist_ok=True)

# 打印当前工作目录（调试用）
print(f"当前工作目录: {os.getcwd()}")
print(f"上传文件夹路径: {app.config['UPLOAD_FOLDER']}")
print(f"静态文件夹路径: {app.config['STATIC_FOLDER']}")

# 路由和业务逻辑
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    death_file = request.files['death_file']
    population_file = request.files['population_file']
    
    death_path = os.path.join(app.config['UPLOAD_FOLDER'], death_file.filename)
    population_path = os.path.join(app.config['UPLOAD_FOLDER'], population_file.filename)
    death_file.save(death_path)
    population_file.save(population_path)
    
    death_df = pd.read_excel(death_path, index_col=0)
    population_df = pd.read_excel(population_path, index_col=0)
    
    if death_df.shape != (81, 100) or population_df.shape != (81, 100):
        return "文件格式错误，请确保为81行100列！"
    
    mortality_df = death_df / population_df
    
    data = []
    for age in mortality_df.index:
        for year in mortality_df.columns:
            cohort = int(year) - age
            mortality = mortality_df.loc[age, year]
            data.append({
                'Age': age,
                'Year': year,
                'Cohort': cohort,
                'Mortality': mortality
            })
    df = pd.DataFrame(data)
    
    formula = 'Mortality ~ C(Age) + C(Year) + C(Cohort)'
    model = glm(formula, data=df, family=Poisson()).fit()
    
    params = model.summary().as_text()
    
    def plot_effect(category, title, filename):
        effects = model.params[model.params.index.str.startswith(f'C({category})')]
        plt.figure()
        effects.plot(kind='line')
        plt.title(title)
        image_path = os.path.join(app.config['STATIC_FOLDER'], filename)
        plt.savefig(image_path)
        plt.close()
    
    plot_effect('Age', 'Age Effect', 'age_effect.png')
    plot_effect('Year', 'Period Effect', 'period_effect.png')
    plot_effect('Cohort', 'Cohort Effect', 'cohort_effect.png')
    
    return render_template('results.html', params=params)

if __name__ == '__main__':
    app.run(debug=True)