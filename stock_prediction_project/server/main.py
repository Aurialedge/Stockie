import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn import metrics
import warnings
warnings.filterwarnings('ignore')

# Load the dataset
df = pd.read_csv('Tesla.csv')

# Display initial data
print('Shape of the dataset:', df.shape)
print('\n--- First 5 rows of the dataset ---\n', df.head())
print('\n--- Data types and non-null values ---\n')
df.info()
print('\n--- Summary statistics ---\n', df.describe())
print('\n--- Null values count ---\n', df.isnull().sum())

# Visualize closing prices
plt.figure(figsize=(15,5))
plt.plot(df['Close'])
plt.title('Tesla Close Price.', fontsize=15)
plt.ylabel('Price in dollars.')
plt.show()

# Feature engineering
df['Date'] = pd.to_datetime(df['Date'])
df['month'] = df['Date'].dt.month
df['year'] = df['Date'].dt.year
df['day'] = df['Date'].dt.day

# Group by year and calculate mean
data_grouped = df.groupby('year').mean()
plt.figure(figsize=(15,5))
sb.barplot(x=data_grouped.index, y=data_grouped['Close'])
plt.title('Tesla Stock Prices by Year')
plt.xlabel('Year')
plt.ylabel('Average Close Price')
plt.show()

# More feature engineering
df['Open-Close'] = df['Open'] - df['Close']
df['High-Low'] = df['High'] - df['Low']
X = df[['Open-Close', 'High-Low']]
y = np.where(df['Close'].shift(-1) > df['Close'], 1, 0)

# Split data and scale features
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train and evaluate models
models = {
    'Logistic Regression': LogisticRegression(),
    'Support Vector Machine': SVC(),
    'XGBoost Classifier': XGBClassifier()
}

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f'\n--- {name} ---')
    print('Accuracy:', metrics.accuracy_score(y_test, y_pred))
    print('Confusion Matrix:\n', metrics.confusion_matrix(y_test, y_pred))
    print('Classification Report:\n', metrics.classification_report(y_test, y_pred))
