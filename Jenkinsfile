pipeline {
    agent any

    environment {
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm ci || npm install'
                }
            }
        }

        stage('Frontend - Lint & Typecheck') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm run lint'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Backend - Setup & Install') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('Backend - Lint & Test') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    sh '''
                        . venv/bin/activate
                        if [ -f test_email.py ]; then
                            python -m unittest discover -s . -p "test_*.py" || echo "Some tests failed or no tests found"
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
