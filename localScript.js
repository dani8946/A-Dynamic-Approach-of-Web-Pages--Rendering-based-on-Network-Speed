document.addEventListener('DOMContentLoaded', function () {
    const testResultsDiv = document.getElementById("testResults");
    const testImageURL = "https://www.freepik.com/free-vector/ping-pong-paddles-table-tennis-rackets-top-bottom-view-sports-equipment-with-wooden-handle-rubber-red-black-bat-surface-isolated-white-background-realistic-3d-vector-illustration_12120280.htm#query=ping&position=0&from_view=keyword&track=sph&uuid=de5c791f-b8f6-4636-a9e3-8fe7a41b7a84";
    const fileSizeInBytes = 550; 
    const numberOfFetches = 1;

    testResultsDiv.innerText = "Initializing speed test...";
    
    let completedFetches = 0;
    let totalSpeedMbps = 0;
    let captionsGenerated = false; // Variable to track whether captions are already generated

    function fetchFile() {
        const singleFetchStartTime = new Date().getTime();

        fetch(testImageURL)
            .then(response => response.blob())
            .then(blob => {
                const singleFetchEndTime = new Date().getTime();
                const timeInSeconds = (singleFetchEndTime - singleFetchStartTime) / 1000;
                const speedMbps = ((fileSizeInBytes * 8) / timeInSeconds / 1024) / 1024;
                totalSpeedMbps += speedMbps;

                completedFetches++;//1

                if (completedFetches === numberOfFetches) {
                    const averageSpeedMbps = totalSpeedMbps / numberOfFetches;
                    testResultsDiv.innerText = `Network speed: ${averageSpeedMbps.toFixed(2)} Mbps`;

                    if(0.1 < averageSpeedMbps < 2 && !captionsGenerated) { // Check if captions are not already generated
                        testResultsDiv.innerText += "\nAttempting to minify and captionise.. ";
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, { action: "minifyandcaptionContent", networkSpeed: speedMbps });
                            captionsGenerated = true; // Mark captions as generated
                        });
                    }
                    else if( 2 < averageSpeedMbps < 5 && !captionsGenerated) { // Check if captions are not already generated
                        testResultsDiv.innerText += "\nAttempting to minify and compress...";
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, { action: "minifyandcaptionContent", networkSpeed: speedMbps });
                            captionsGenerated = true; // Mark captions as generated
                        });
                    } 
                    else {
                        testResultsDiv.innerText += "\nNo need to optimise";
                    }
                } else {
                    fetchFile(); 
                }
            })
            .catch(error => {
                console.error(error);
                testResultsDiv.innerText = "Error measuring speed.";
            });
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, { file: 'contentScript1.js' }, function () {
            fetchFile();
        });
    });
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.status === "minificationandcompCompleted") {
            testResultsDiv.innerText = "Minification and Compression completed!";
        } else if (message.status === "minificationandcaptionCompleted") {
            testResultsDiv.innerText = "Minification and Captioning completed!";
        }
    });
});
