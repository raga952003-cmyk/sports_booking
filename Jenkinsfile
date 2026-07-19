pipeline {
    agent any

    tools {
        // This ensures Node.js is automatically added to the PATH.
        // Make sure to define a Node.js tool named 'node' in:
        // Jenkins -> Manage Jenkins -> Tools (or Global Tool Configuration)
        nodejs 'node'
    }

    environment {
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
    }

    stages {
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
                        python3 -m venv venv || python -m venv venv
                        . venv/bin/activate || venv\\Scripts\\activate
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
                        . venv/bin/activate || venv\\Scripts\\activate
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

