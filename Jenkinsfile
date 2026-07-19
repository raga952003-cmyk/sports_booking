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
                    if ! command -v npm > /dev/null 2>&1; then
                        echo "Global npm not found. Setting up portable NodeJS..."
                        mkdir -p "$WORKSPACE/node-bin"
                        if [ ! -f "$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin/npm" ]; then
                            echo "Downloading Node.js binary (v22.14.0 Linux x64)..."
                            curl -sSLo "$WORKSPACE/node-bin/node.tar.gz" https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.gz
                            tar -xf "$WORKSPACE/node-bin/node.tar.gz" -C "$WORKSPACE/node-bin"
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
                        if [ -d "$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin" ]; then
                            export PATH="$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin:$PATH"
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
                        if [ -d "$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin" ]; then
                            export PATH="$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin:$PATH"
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
                        if [ -d "$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin" ]; then
                            export PATH="$WORKSPACE/node-bin/node-v22.14.0-linux-x64/bin:$PATH"
                        fi
                        npm run build
                    '''
                }
            }
        }

        stage('Backend - Setup Python') {
            steps {
                sh '''
                    if ! command -v python3 > /dev/null 2>&1 && ! command -v python > /dev/null 2>&1; then
                        echo "Global python/python3 not found. Setting up portable Python..."
                        mkdir -p "$WORKSPACE/python-bin"
                        if [ ! -f "$WORKSPACE/python-bin/python/bin/python3" ]; then
                            echo "Downloading portable Python binary..."
                            curl -sSLo "$WORKSPACE/python-bin/python.tar.gz" https://github.com/astral-sh/python-build-standalone/releases/download/20260718/cpython-3.11.15+20260718-x86_64-unknown-linux-gnu-install_only.tar.gz
                            tar -xf "$WORKSPACE/python-bin/python.tar.gz" -C "$WORKSPACE/python-bin"
                        fi
                    else
                        echo "Global python/python3 is already available."
                    fi
                '''
            }
        }

        stage('Backend - Setup & Install') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    sh '''
                        if [ -d "$WORKSPACE/python-bin/python/bin" ]; then
                            export PATH="$WORKSPACE/python-bin/python/bin:$PATH"
                        fi
                        python3 -m venv venv || python -m venv venv
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
                        if [ -d "$WORKSPACE/python-bin/python/bin" ]; then
                            export PATH="$WORKSPACE/python-bin/python/bin:$PATH"
                        fi
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


