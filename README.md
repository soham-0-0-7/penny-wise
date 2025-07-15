# 💰 Penny Wise

**Penny Wise** is a smart and simple expense tracker that helps you maintain a perfect record of your **savings, investments, and expenses**, tailored to your **monthly income range**.

It uses **AWS DynamoDB** for storing data and is containerized using **Docker**, making it easy to run locally or host on an **AWS EC2 instance**.

## 🧠 How It Works

The app classifies your spending into 4 categories based on your monthly income:
- **Necessities**
- **Discretionary**
- **Savings**
- **Investments**

| Monthly Income (₹)      | Necessities (%) | Discretionary (%) | Savings (%) | Investments (%) |
|--------------------------|------------------|--------------------|--------------|------------------|
| ≤ 20,000                 | 65%              | 5%                 | 15%          | 15%              |
| 20,001 - 50,000          | 55%              | 10%                | 15%          | 20%              |
| 50,001 - 1,00,000        | 45%              | 10%                | 15%          | 30%              |
| 1,00,001 - 2,00,000      | 40%              | 10%                | 10%          | 40%              |
| > 2,00,000               | 35%              | 10%                | 10%          | 45%              |

## 📦 Tech Stack

- **Frontend/Backend**: Dockerized Fullstack App
- **Database**: AWS DynamoDB
- **Cloud Hosting**: AWS EC2

---

## 🚀 Running Locally

> Make sure you have AWS credentials and DynamoDB tables set up before running the app.

### ✅ Prerequisites

- Create the following DynamoDB tables on AWS:
  - `users`
  - `expenses`
  - `notifications`
- Generate a pair of **Access Key** and **Secret Key** from AWS IAM

### 🐳 Steps to Run

```bash
# 1. Install Docker
https://docs.docker.com/get-docker/

# 2. Pull the Docker image
docker pull soham794/penny-wise:latest

# 3. Run the container with your AWS credentials
docker run -d -p 3000:3000 \
  -e ACCESS_KEY=<YOUR AWS ACCESS KEY> \
  -e SECRET_KEY=<YOUR AWS SECRET KEY> \
  soham794/penny-wise:latest

# 4. Open your browser and visit:
http://localhost:3000
```

### 🐳 Steps to Host on EC2

```bash
# 1. Update system and install Docker
sudo apt update && sudo apt install -y docker.io

# 2. Start Docker and give permission to your user
sudo systemctl start docker
sudo usermod -aG docker $USER

# 3. Pull the Docker image
docker pull soham794/penny-wise:latest

# 4. Run the container (on port 80)
docker run -d -p 80:3000 \
  -e ACCESS_KEY=your_access_key \
  -e SECRET_KEY=your_secret_key \
  soham794/penny-wise:latest
```

#### My hosted project on EC2 ( video ) - https://drive.google.com/file/d/1Kd8K-nvWrImhj429QNX0qO1vR0CVbL8b/view?usp=drive_link 

#### Docker Link - https://hub.docker.com/r/soham794/penny-wise
