def FirstRemote=[:]
FirstRemote.name = 'SGP-WEBAPP-F-01'
FirstRemote.host = '172.20.40.68'
FirstRemote.port = 22
// FirstRemote.port = 2204
FirstRemote.allowAnyHosts = true

pipeline{
    agent any
    options {
        disableConcurrentBuilds()
    }
    environment {
        SGP_WEBAPP_F_01 = credentials('sgp-webapp-f-01-creds')
    }

    tools{
        nodejs 'NodeJS-18.19.1'
    }

    stages {
        stage('clean workspace'){
            steps{
                cleanWs()
            }
        }

        stage('Checkout From GitLab'){
            steps{
                checkout scm
            }
        }

        stage('Stop SOCAR_Front_Admin in supervisor on Remote Machine'){
            steps{
                script{
                    FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                    FirstRemote.password=env.SGP_WEBAPP_F_01_PSW
                }
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} supervisorctl stop SOCAR_Front_Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Delete Content of SOCAR_SOCAR_Front_Admin folder on remote machine'){
            steps{
                script{
                    FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                    FirstRemote.password=env.SGP_WEBAPP_F_01_PSW
                }
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} rm -rf /var/www/SOCAR-Front-Admin/*")
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} rm -rf /var/www/SOCAR-Front-Admin/*.*")
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} rm -rf /var/www/SOCAR-Front-Admin/.*")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Copy Folder to remote machine in temp Directory'){
            steps{
                dir("$env.WORKSPACE"){
                    script{
                        FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                        FirstRemote.password=env.SGP_WEBAPP_F_01_PSW
                    }
                    sshPut remote: FirstRemote, from: "${env.WORKSPACE}/", into: '/var/www/SOCAR-Front-Admin/'
                    sleep(time:5, unit: "SECONDS")
                }
            }
        }

        stage('Move from temp Directory to Real One'){
            steps{
                // dir("$env.WORKSPACE"){
                script{
                    def workspacePath = env.WORKSPACE
                    def folderName = workspacePath.tokenize('/').last()

                    FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                    FirstRemote.password=env.SGP_WEBAPP_F_01_PSW

                    sh "echo ${folderName}"
                    sshCommand(remote: FirstRemote, command: "mv /var/www/SOCAR-Front-Admin/${folderName}/* /var/www/SOCAR-Front-Admin/")
                    sshCommand(remote: FirstRemote, command: "mv /var/www/SOCAR-Front-Admin/${folderName}/.* /var/www/SOCAR-Front-Admin/")
                    sleep(time:5, unit: "SECONDS")
                // }
                }
            }
        }

        stage('Build'){
            steps{
                script{
                    FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                    FirstRemote.password=env.SGP_WEBAPP_F_01_PSW
                }
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} npm install next --prefix /var/www/SOCAR-Front-Admin")
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} npm run build --prefix /var/www/SOCAR-Front-Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }


        stage('Give Proper Permissions'){
            steps{
                script{
                    FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                    FirstRemote.password=env.SGP_WEBAPP_F_01_PSW
                }
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} chown -R user:user /var/www/SOCAR-Front-Admin")
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} chmod -R 775 /var/www/SOCAR-Front-Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Start SOCAR_Front_Admin in supervisor on Remote Machine'){
            steps{
                script{
                    FirstRemote.user=env.SGP_WEBAPP_F_01_USR
                    FirstRemote.password=env.SGP_WEBAPP_F_01_PSW
                }
                sshCommand(remote: FirstRemote, command: "sudo -S <<< ${FirstRemote.password=env.SGP_WEBAPP_F_01_PSW} supervisorctl start SOCAR_Front_Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }

    }


    post {
        always {
            echo 'Always run'
        }
        success {
            emailext attachLog: true, 
                subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'", 
                body: 
                """
                Job Full Path: ${currentBuild.fullDisplayName}<br>
                Git Branch: ${env.GIT_BRANCH} <br>
                Build Number: ${env.BUILD_NUMBER} <br>
                Build Duration: ${currentBuild.durationString} <br>
                Build Timestamp: ${env.BUILD_TIMESTAMP} <br><br>
                
                Result: ${currentBuild.result}<br>
                """,
                from: 'jenkins@socar.ge',
                to: 'b.kokhodze@optimogroup.io'
        }
        failure {
            emailext attachLog: true,
                subject: "Failed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'", 
                body: 
                """
                Job Full Path: ${currentBuild.fullDisplayName}<br>
                Git Branch: ${env.GIT_BRANCH} <br>
                Build Number: ${env.BUILD_NUMBER} <br>
                Build Duration: ${currentBuild.durationString} <br>
                Build Timestamp: ${env.BUILD_TIMESTAMP} <br><br>

                Result: ${currentBuild.result}<br>
                """,
                from: 'jenkins@socar.ge',
                to: 'b.kokhodze@optimogroup.io'
        }
        unstable {
            echo 'Unstuble build'
        }
        changed {
            echo 'State of pipeline changed'
        }
    }
}