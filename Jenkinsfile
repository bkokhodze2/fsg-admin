def Remote=[:]
Remote.name = 'SGP-WEBAPP-F-DEV'
Remote.host = '172.20.40.73'
Remote.port = 22
// FirstRemote.port = 2204
Remote.allowAnyHosts = true


pipeline{
    agent any
    options {
        disableConcurrentBuilds()
    }
    environment {
        SGP_WEBAPP_F_DEV = credentials('sgp-webapp-f-dev-creds')
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
                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                }
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} supervisorctl stop SOCAR_Front_Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Delete Content of SOCAR_SOCAR_Front_Admin folder on remote machine'){
            steps{
                script{
                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                }
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} rm -rf /var/www/SOCAR-Front-Admin/*")
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} rm -rf /var/www/SOCAR-Front-Admin/*.*")
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} rm -rf /var/www/SOCAR-Front-Admin/.*")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Copy Folder to remote machine in temp Directory'){
            steps{
                dir("$env.WORKSPACE"){
                    script{
                        Remote.user=env.SGP_WEBAPP_F_DEV_USR
                        Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                    }                 
                    sshPut remote: Remote, from: "${env.WORKSPACE}/", into: '/var/www/SOCAR-Front-Admin/'
                    // sshCommand(remote: Remote, command: "systemctl status nginx")
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

                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                      
                    sh "echo ${folderName}"
                    sshCommand(remote: Remote, command: "mv /var/www/SOCAR-Front-Admin/${folderName}/* /var/www/SOCAR-Front-Admin/")
                    sshCommand(remote: Remote, command: "mv /var/www/SOCAR-Front-Admin/${folderName}/.* /var/www/SOCAR-Front-Admin/")
                    // sshCommand(remote: Remote, command: "systemctl status nginx")
                    sleep(time:5, unit: "SECONDS")
                // }
                }
            }
        }

        stage('Build'){
            steps{
                script{
                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                }
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} npm install next --prefix /var/www/SOCAR-Front-Admin")
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} npm run build --prefix /var/www/SOCAR-Front-Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }


        stage('Give Proper Permissions'){
            steps{
                script{
                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                }
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} chown -R user:user /var/www/SOCAR-Front-Admin")
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} chmod -R 775 /var/www/SOCAR-Front-Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Start SOCAR_Front_Admin in supervisor on Remote Machine'){
            steps{
                script{
                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                }
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} supervisorctl start SOCAR_Front_Admin")
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
                to: 'l.medoshvili@bmsapplications.com'
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
                to: 'l.medoshvili@bmsapplications.com'
        }
        unstable {
            echo 'Unstuble build'
        }
        changed {
            echo 'State of pipeline changed'
        }
    }
}