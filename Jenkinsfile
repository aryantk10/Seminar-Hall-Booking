pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_VERSION = '2.0.0'
        SNYK_TOKEN = credentials('snyk-token')
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install -g snyk
                    snyk auth $SNYK_TOKEN
                '''
            }
        }

        stage('Code Quality') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    try {
                        sh 'snyk test'
                        sh 'snyk container test frontend'
                    } catch (err) {
                        echo 'Security vulnerabilities found'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'docker-compose up -d'
                sh 'docker-compose run frontend npm test'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose down'
            cleanWs()
        }
    }
} 