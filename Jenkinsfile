pipeline {
    agent { label 'gis' }

    environment {
        OLD_TAG="1.0"
        NEW_TAG="1.0"
        IMG_NAME="abdelrahmankha/gis-app-front"
        APP_NAME = "frontend"
    }

    stages {
        stage('build') {
           steps {
                echo 'Building Docker image...'
                catchError {
                    sh "docker stop ${APP_NAME}"
                    sh "docker rm -f ${APP_NAME}"
                }  
                catchError {
                    sh "docker rmi -f ${IMG_NAME}:${OLD_TAG}"
                }                   
                sh "docker build -t ${IMG_NAME}:${NEW_TAG} ."
           }
       }
       stage('deploy') {
           steps {
               script {
                    echo 'deploying image....'
                    sh "docker run -d --name ${APP_NAME} -p80:80 ${IMG_NAME}:${NEW_TAG}"
               }
            }
        }
       stage('Push to Dockerhub'){
           steps {
               echo 'pushing to dockerhub repo...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'USERNAME', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USERNAME --password-stdin'
                    sh "docker push ${IMG_NAME}:${NEW_TAG}"
                }
           }
       }
       
    }
}