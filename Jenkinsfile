
// supervisorctl stop socar_admin_front_main
// supervisorctl stop socar_front_main 

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

        // stage('Build NodeJS'){
        //     steps{
        //         dir("$env.WORKSPACE"){
        //             sh 'node --version'
        //             sh 'npm --version'
        //             sh 'npm install next --verbose'
        //             sh 'npm run build'
        //             sh 'pwd'
        //             sh 'ls -l'
        //         }
        //     }
        // }

        stage('Stop socar_front_main in supervisor on Remote Machine'){
            steps{
                script{
                    Remote.user=env.SGP_WEBAPP_F_DEV_USR
                    Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                }
                sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} supervisorctl stop SOCAR_Front_Admin")
                sleep(time:5, unit: "SECONDS")
            }
        }

        stage('Delete Content of SOCAR_Front folder on remote machine'){
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
                // sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} \$(cd /var/www/socar-front-main && npm install next)")
                // sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_DEV_PSW} \$(cd /var/www/socar-front-main && npm run build)")
                sleep(time:5, unit: "SECONDS")
            }
        }

        // stage('Delete Temp Folder'){
        //     steps{
        //         // dir("$env.WORKSPACE"){
        //         script{
        //             def workspacePath = env.WORKSPACE
        //             def folderName = workspacePath.tokenize('/').last()

        //             Remote.user=env.SGP_WEBAPP_F_DEV_USR
        //             Remote.password=env.SGP_WEBAPP_F_DEV_PSW
                      
        //             sh "echo ${folderName}"
        //             sshCommand(remote: Remote, command: "rm -rf /var/www/socar-front-main/${folderName}")
        //             // sshCommand(remote: Remote, command: "systemctl status nginx")
        //             sleep(time:5, unit: "SECONDS")
        //         // }
        //         }
        //     }
        // }

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

        stage('Start socar_front_main in supervisor on Remote Machine'){
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

//         stage('Stop socar_front_main in supervisor on Remote Machine'){
//             steps{
//                 script{
//                     Remote.user=env.SGP_WEBAPP_F_USR
//                     Remote.password=env.SGP_WEBAPP_F_PSW
//                 }
//                 sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_PSW} supervisorctl stop SOCAR_Front")
//                 sleep(time:5, unit: "SECONDS")
//             }
//         }

//         stage('Delete socar-front-main folder on remote machine'){
//             steps{
//                 script{
//                     Remote.user=env.SGP_WEBAPP_F_USR
//                     Remote.password=env.SGP_WEBAPP_F_PSW
//                 }
//                 sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_PSW} rm -rf /var/www/socar-front-main")
//                 sleep(time:5, unit: "SECONDS")
//             }
//         }

//         stage('Copy build files to remote machine'){
//             steps{
//                 dir("$env.WORKSPACE"){
//                     script{
//                         Remote.user=env.SGP_WEBAPP_F_USR
//                         Remote.password=env.SGP_WEBAPP_F_PSW
//                     }
//                     sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_PSW} mkdir -p /var/www/socar-front-main")
//                     sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_PSW} chmod --reference=/var/www/socar-admin-front-main /var/www/socar-front-main")
//                     sshCommand(remote: Remote, command: "sudo -S <<< ${Remote.password=env.SGP_WEBAPP_F_PSW} chown --reference=/var/www/socar-admin-front-main /var/www/socar-front-main")                 
//                     sshPut remote: Remote, from: '*.*', into: '/var/www/socar-front-main'
//                     // sshCommand(remote: Remote, command: "systemctl status nginx")
//                     sleep(time:5, unit: "SECONDS")
//                 }
//             }
//         }

        // stage('Start nginx on Remote Machine'){
        //     steps{
        //         script{
        //             Remote.user=env.SGP_WEBAPP_F_USR
        //             Remote.password=env.SGP_WEBAPP_F_PSW
        //         }
        //         sshCommand(remote: Remote, command: "systemctl start nginx")
        //         sleep(time:5, unit: "SECONDS")
        //     }
        // }

    // }


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