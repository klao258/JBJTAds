pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        PM2_HOME = "${env.WORKSPACE}/.pm2"
    }

    triggers {
        githubPush()
    }

    stages {
        stage('拉取代码') {
            steps {
                echo '📥 拉取 GitHub 最新代码...'
                sh 'sudo rm -rf client/dist/'
                checkout scm
            }
        }

        stage('安装依赖') {
            steps {
                echo '📦 安装依赖...'
                sh 'sudo npm install'
            }
        }

        stage('使用 PM2 启动服务') {
            steps {
                echo '🚀 使用 PM2 启动 Launcher（start.js）...'

                // 删除旧服务
                sh 'sudo pm2 delete JBJTAds || true'

                // 启动封装脚本
                sh 'sudo pm2 start ecosystem.config.cjs --only JBJTAds'

                // 保存 PM2 状态（可选）
                sh 'sudo pm2 save'

                // 显示当前状态
                sh 'sudo pm2 list'
            }
        }
    }

    post {
        success {
            echo '✅ 部署完成，访问地址：http://jbjtads.sso66s.cc'
        }
        failure {
            echo '❌ 部署失败，请检查日志'
        }
    }
}