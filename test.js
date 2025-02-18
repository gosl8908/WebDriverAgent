// const { remote } = require('webdriverio');

// (async () => {
//     const capabilities = {
//         "appium:platformName": "iOS",
//         "appium:platformVersion": "18.3.1", // iOS 버전
//         "appium:deviceName": "강해성의 iPhone", // 기기 이름
//         "appium:automationName": "XCUITest",
//         "appium:udid": "00008120-000958A036F8C01E", // 연결된 iPhone의 UDID
//         // "appium:useNewWDA": true,
//         "appium:noReset": true,
//         "appium:fullContextList": true,
//         "appium:bundleId": "com.google.ios.youtube", // iOS YouTube 앱의 올바른 Bundle ID
//     };

//     const driver = await remote({
//         capabilities,
//         hostname: '127.0.0.1', // Appium 서버가 실행 중인 호스트
//         port: 4723, // Appium 기본 포트
//         path: '/' // Appium 서버의 경로
//     });

//     // YouTube 앱 실행 후 대기
//     await driver.pause(5000); // 앱이 실행될 때까지 대기 (필요에 따라 조정)

//     // 앱이 실행된 후 필요한 추가 작업을 여기 추가할 수 있습니다.

//     await driver.deleteSession();
// })();
const { remote } = require('webdriverio');
const { exec } = require('child_process');

// 첫 번째 명령어로 xcodebuild 실행
const xcodebuildProcess = exec('xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination "id=00008120-000958A036F8C01E" test -allowProvisioningUpdates');

// xcodebuild 출력 처리
xcodebuildProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

xcodebuildProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

xcodebuildProcess.on('close', (code) => {
    if (code !== 0) {
        console.error(`xcodebuild 프로세스가 ${code} 코드로 종료되었습니다.`);
        return;
    }

    console.log('xcodebuild 완료. WebDriverAgent가 준비되었습니다.');

    // WebDriverAgent가 준비되었으면 Appium 서버 실행
    exec('appium --address 127.0.0.1 --port 4723', (error, stdout, stderr) => {
        if (error) {
            console.error(`Appium 실행 중 오류 발생: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Appium stderr: ${stderr}`);
            return;
        }

        console.log(`Appium stdout: ${stdout}`);

        // Appium 서버가 정상적으로 실행되었으면 WebDriverIO로 테스트 실행
        (async () => {
            const capabilities = {
                "appium:platformName": "iOS",
                "appium:platformVersion": "18.3.1", // iOS 버전
                "appium:deviceName": "강해성의 iPhone", // 기기 이름
                "appium:automationName": "XCUITest",
                "appium:udid": "00008120-000958A036F8C01E", // UDID
                "appium:noReset": true,
                "appium:fullContextList": true,
                "appium:bundleId": "com.google.ios.youtube", // YouTube Bundle ID
                "appium:useNewWDA": true,  // WebDriverAgent 새로 실행
            };

            try {
                const driver = await remote({
                    capabilities,
                    hostname: '127.0.0.1', // Appium 서버 호스트
                    port: 4723, // Appium 기본 포트
                    path: '/' // Appium 서버 경로
                });

                // 앱 실행 후 대기
                await driver.pause(5000); // YouTube 앱이 실행될 때까지 대기

                // 추가 작업이 필요한 경우 이곳에 추가

                // 세션 종료
                await driver.deleteSession();
            } catch (err) {
                console.error('WebDriverIO 테스트 실행 중 오류 발생:', err);
            }
        })();
    });
});
