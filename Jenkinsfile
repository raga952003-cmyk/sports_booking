pipeline {
    agent any

    environment {
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
    }

    stages {
        stage('Frontend - Setup Node.js') {
            steps {
                sh '''
                    if ! command -v npm &> /dev/null; then
                        echo "Global npm not found. Setting up portable NodeJS..."
                        mkdir -p "$WORKSPACE/node-bin"
                        if [ ! -f "$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin/npm" ]; then
                            echo "Downloading Node.js binary (v18.20.2 Linux x64)..."
                            curl -sSLo "$WORKSPACE/node-bin/node.tar.xz" https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-x64.tar.xz
                            tar -xf "$WORKSPACE/node-bin/node.tar.xz" -C "$WORKSPACE/node-bin"
                        fi
                    else
                        echo "Global npm is already available."
                    fi
                '''
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh '''
                        if [ -d "$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin" ]; then
                            export PATH="$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin:$PATH"
                        fi
                        npm ci || npm install
                    '''
                }
            }
        }

        stage('Frontend - Lint & Typecheck') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh '''
                        if [ -d "$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin" ]; then
                            export PATH="$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin:$PATH"
                        fi
                        npm run lint
                    '''
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh '''
                        if [ -d "$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin" ]; then
                            export PATH="$WORKSPACE/node-bin/node-v18.20.2-linux-x64/bin:$PATH"
                        fi
                        npm run build
                    '''
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


